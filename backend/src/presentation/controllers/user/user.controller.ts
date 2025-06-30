import { Request, Response } from 'express';
import { GetUserUseCase } from '@/app/useCases/getUser.useCase';
import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { GetGymsUseCase } from '@/app/useCases/getGyms.useCase';
import { GetGymDetailsUseCase } from '@/app/useCases/getGymDetails.useCase';
import { GetGymDetailsRequestDTO } from '@/domain/dtos/getGymDetailsRequest.dto';

export class UserController {
 constructor(
    private getUserUseCase: GetUserUseCase,
    private getGymsUseCase: GetGymsUseCase,
    private getGymDetailsUseCase: GetGymDetailsUseCase
  ) {}

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
}