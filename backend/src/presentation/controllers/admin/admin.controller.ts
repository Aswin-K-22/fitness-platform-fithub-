// src/presentation/controllers/admin/admin.controller.ts

import { Request, Response } from 'express';
import { GetAdminUseCase } from '@/app/useCases/getAdmin.useCase';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { GetUsersUseCase } from '@/app/useCases/getUsers.useCase';
import { ToggleUserVerificationUseCase } from '@/app/useCases/toggleUserVerification.useCase';
import { IGetUsersRequestDTO } from '@/domain/dtos/getUsersRequest.dto';
import { GetTrainersUseCase } from '@/app/useCases/getTrainers.useCase';
import { ApproveTrainerUseCase } from '@/app/useCases/approveTrainer.useCase';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';
import { GetAdminGymsUseCase } from '@/app/useCases/getAdminGyms.useCase';
import { GetAdminGymsRequestDTO } from '@/domain/dtos/getAdminGymsRequest.dto';
import { AddGymUseCase } from '@/app/useCases/addGym.useCase';
import { GetAvailableTrainersUseCase } from '@/app/useCases/getAvailableTrainers.useCase';
import { GymErrorType } from '@/domain/enums/gymErrorType.enums';
import { AddGymRequestDTO } from '@/domain/dtos/addGymRequest.dto';
import { MulterError } from 'multer';
import { GetAdminMembershipPlansUseCase } from '@/app/useCases/getAdminMembershipPlans.useCase';
import { MembershipErrorType } from '@/domain/enums/membershipErrorType.enum';
import { AddMembershipPlanUseCase } from '@/app/useCases/addMembershipPlan.useCase';

export class AdminController {
  constructor(
    private getAdminUseCase: GetAdminUseCase,
private getUsersUseCase: GetUsersUseCase,
    private toggleUserVerificationUseCase: ToggleUserVerificationUseCase,
    private getTrainersUseCase: GetTrainersUseCase,
    private approveTrainerUseCase: ApproveTrainerUseCase,
    private getAdminGymsUseCase: GetAdminGymsUseCase,
     private addGymUseCase: AddGymUseCase,
    private getAvailableTrainersUseCase: GetAvailableTrainersUseCase,
    private getAdminMembershipPlansUseCase: GetAdminMembershipPlansUseCase,
    private addMembershipPlanUseCase: AddMembershipPlanUseCase
) {}

async getMembershipPlans(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const request = {
        page: Number(page),
        limit: Number(limit),
      };

      const response = await this.getAdminMembershipPlansUseCase.execute(request);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case MembershipErrorType.InvalidPagination:
            res.status(400).json({ message: 'Invalid pagination parameters' });
            break;
          case MembershipErrorType.DatabaseError:
            res.status(500).json({ message: 'Failed to fetch membership plans' });
            break;
          default:
            res.status(500).json({ message: 'Internal server error' });
        }
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
  async addMembershipPlan(req: Request, res: Response) {
    try {
      const response = await this.addMembershipPlanUseCase.execute(req.body);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case MembershipErrorType.PlanAlreadyExists:
            res.status(400).json({ message: 'A plan with this name already exists' });
            break;
          case MembershipErrorType.DatabaseError:
            res.status(500).json({ message: 'Failed to create membership plan' });
            break;
          case MembershipErrorType.UnknownError:
            res.status(500).json({ message: 'An unexpected error occurred' });
            break;
          default:
            res.status(400).json({ message: error.message });
        }
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  }
  

 async addGym(req: Request, res: Response): Promise<void> {
    try {
      const imageFiles = req.files as Express.Multer.File[] | undefined;
      const imageUrls = imageFiles?.map((file) => `/Uploads/${file.filename}`) || [];

      if (!req.body.gymData) {
        throw new Error(GymErrorType.MissingRequiredFields);
      }

      const gymData: AddGymRequestDTO = JSON.parse(req.body.gymData);

      const response = await this.addGymUseCase.execute(gymData, imageUrls);

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating gym:', error);
      if (error instanceof MulterError) {
        console.error('Error creating gym:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: 'Uploaded file is too large. Maximum size allowed is 10MB.',
            error: error.code,
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Multer error: ${error.message}`,
          error: error.code,
        });
        return;
      }
      const message = error instanceof Error ? error.message : 'Internal server error while creating gym';
      res.status(message.includes(GymErrorType.DuplicateGymName) ? 409 : 400).json({
        success: false,
        message,
      });
    }
  }

  async getAvailableTrainers(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.getAvailableTrainersUseCase.execute();
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching available trainers:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error while fetching trainers',
      });
    }
  }



  async getAdmin(req: Request, res: Response): Promise<void> {
    const email = req.admin?.email;
    if (!email) {
      res.status(401).json({ message: 'Admin not authenticated' });
      return;
    }
    const result = await this.getAdminUseCase.execute(email);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ user: result.data?.user });
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const params: IGetUsersRequestDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 3,
        search: req.query.search as string | undefined,
        membership: req.query.membership as string | undefined,
        isVerified: req.query.isVerified as string | undefined,
      };

      const result = await this.getUsersUseCase.execute(params);
      res.status(200).json({
        success: true,
        users: result.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email.address,
          membership: user.memberships?.[0]?.plan?.name || 'None',
          status: user.isVerified ? 'Active' : 'Suspended',
          profilePic: user.profilePic,
          isVerified: user.isVerified,
        })),
        page: params.page,
        totalPages: result.totalPages,
        totalUsers: result.totalUsers,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || UserErrorType.FailedToToggleVerification });
    }
  }

  async toggleUserVerification(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await this.toggleUserVerificationUseCase.execute({ userId });
      res.status(200).json({
        success: true,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email.address,
          membership: result.user.memberships?.[0]?.plan?.name || 'None',
          status: result.user.isVerified ? 'Active' : 'Suspended',
          profilePic: result.user.profilePic,
          isVerified: result.user.isVerified,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || UserErrorType.FailedToToggleVerification });
    }
  }

  async getTrainers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, status, specialization } = req.query;
      const data = {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string | undefined,
        status: status as string | undefined,
        specialization: specialization as string | undefined,
      };

      const response = await this.getTrainersUseCase.execute(data);
      res.status(200).json({
        success: true,
        ...response,
      });
    } catch (error) {
      console.error('Error in getTrainers:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : TrainerErrorType.FailedToFetchTrainers,
      });
    }
  }

  async approveTrainer(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const response = await this.approveTrainerUseCase.execute({ trainerId });
      res.status(200).json({
        success: true,
        trainer: response.trainer,
      });
    } catch (error) {
      console.error('Error in approveTrainer:', error);
      const status = error instanceof Error && error.message === TrainerErrorType.TrainerNotFound ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error instanceof Error ? error.message : TrainerErrorType.InvalidTrainerId,
      });
    }
  }

  async getGyms(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search } = req.query;
      const request: GetAdminGymsRequestDTO = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 5,
        search: typeof search === 'string' ? search : undefined,
      };

      const response = await this.getAdminGymsUseCase.execute(request);
      res.status(200).json({
        success: true,
        gyms: response.gyms,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while fetching gyms',
      });
    }
  }
}