import { Request, Response } from 'express';
import { GetUserUseCase } from '@/app/useCases/getUser.useCase';
import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { GetGymsUseCase } from '@/app/useCases/getGyms.useCase';
import { GetGymDetailsUseCase } from '@/app/useCases/getGymDetails.useCase';
import { GetGymDetailsRequestDTO } from '@/domain/dtos/getGymDetailsRequest.dto';
import { GetMembershipPlansRequestDTO, GetMembershipPlansRequestSchema } from '@/domain/dtos/getMembershipPlansRequest.dto';
import { GetMembershipPlansUseCase } from '@/app/useCases/getMembershipPlans.useCase';
import { InitiateMembershipPaymentUseCase } from '@/app/useCases/initiateMembershipPayment.useCase';
import { VerifyMembershipPaymentUseCase } from '@/app/useCases/verifyMembershipPayment.useCase';
import { UpdateUserProfileUseCase } from '@/app/useCases/updateUserProfile.useCase';
import { IUpdateUserProfileRequestDTO } from '@/domain/dtos/updateUserProfileRequest.dto';
import { VerifyMembershipPaymentRequestDTO, VerifyMembershipPaymentResponseDTO } from '@/domain/dtos/verifyMembershipPayment.dto';
import { InitiateMembershipPaymentRequestDTO, InitiateMembershipPaymentResponseDTO } from '@/domain/dtos/initiateMembershipPayment.dto';
import { GetUserProfileUseCase } from '@/app/useCases/getUserProfile.useCase';

export class UserController {
 constructor(
    private getUserUseCase: GetUserUseCase,
    private getGymsUseCase: GetGymsUseCase,
    private getGymDetailsUseCase: GetGymDetailsUseCase,
    private getMembershipPlansUseCase: GetMembershipPlansUseCase,
    private initiateMembershipPaymentUseCase: InitiateMembershipPaymentUseCase,
    private verifyMembershipPaymentUseCase: VerifyMembershipPaymentUseCase,
    private getUserProfileUseCase : GetUserProfileUseCase,
    private updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {}
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const email = req.user?.email;
      if (!email) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const requestDTO: IUpdateUserProfileRequestDTO = {
        name: req.body.name,
        profilePic: req.file ? `/uploads/${req.file.filename}` : undefined,
      };

      const response = await this.updateUserProfileUseCase.execute(email, requestDTO);
      if (!response.success) {
        res.status(400).json({ success: false, message: response.error });
        return;
      }

      res.status(200).json({ success: true, user: response.data?.user });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const email = req.user?.email;
    if (!email) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const result = await this.getUserUseCase.execute(email);
    if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ user: result.data?.user });
  }

  async getUserProfile(req: Request, res: Response): Promise<void>{
     const email = req.user?.email;
    if (!email) {
       res.status(401).json({ message: "User not authenticated" });
       return
    }
    const result = await this.getUserProfileUseCase.execute(email);
     if (!result.success) {
      res.status(400).json({ message: result.error });
      return;
    }
    res.status(200).json({ user: result.data?.user });
  }
  async getGyms(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, lat, lng, radius, gymType, rating } = req.query;

      const requestDTO: GetGymsRequestDTO = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string | undefined,
        lat: lat ? parseFloat(lat as string) : undefined,
        lng: lng ? parseFloat(lng as string) : undefined,
        radius: radius ? parseInt(radius as string) : undefined,
        gymType: gymType as string | undefined,
        rating: rating as string | undefined,
      };

      const response = await this.getGymsUseCase.execute(requestDTO);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching gyms:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }
  async getGymDetails(req: Request, res: Response): Promise<void> {
    try {
      const { gymId } = req.params;
      const requestDTO: GetGymDetailsRequestDTO = { gymId };

      const response = await this.getGymDetailsUseCase.execute(requestDTO);
      if (!response.success || !response.data) {
        res.status(404).json({ success: false, message: 'Gym not found' });
        return;
      }
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching gym details:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  async getMembershipPlans(req: Request, res: Response): Promise<void> {
    try {
      const requestDTO: GetMembershipPlansRequestDTO = GetMembershipPlansRequestSchema.parse(req.query);

      // Call use case with validated page and limit
      const response = await this.getMembershipPlansUseCase.execute(requestDTO.page, requestDTO.limit);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching membership plans:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  async initiateMembershipPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // From auth middleware
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const requestDTO: InitiateMembershipPaymentRequestDTO = {
        planId: req.body.planId,
      };
      const response: InitiateMembershipPaymentResponseDTO = await this.initiateMembershipPaymentUseCase.execute(requestDTO, userId);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error initiating membership payment:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  async verifyMembershipPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // From auth middleware
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const requestDTO: VerifyMembershipPaymentRequestDTO = {
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_signature: req.body.razorpay_signature,
        planId: req.body.planId,
      };
      const response: VerifyMembershipPaymentResponseDTO = await this.verifyMembershipPaymentUseCase.execute(requestDTO, userId);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error verifying membership payment:', error);
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }
}