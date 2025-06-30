import { Request, Response } from 'express';
import { GetUserUseCase } from '@/app/useCases/getUser.useCase';
import { GetGymsRequestDTO } from '@/domain/dtos/getGymsRequest.dto';
import { GetGymsUseCase } from '@/app/useCases/getGyms.useCase';

export class UserController {
 constructor(
    private getUserUseCase: GetUserUseCase,
    private getGymsUseCase: GetGymsUseCase
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
}