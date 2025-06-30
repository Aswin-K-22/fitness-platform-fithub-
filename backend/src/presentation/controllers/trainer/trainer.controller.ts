// backend/src/infrastructure/controllers/trainer.controller.ts
import { Request, Response } from 'express';
import { GetTrainerUseCase } from '@/app/useCases/getTrainer.useCase';
import { Result, ITrainerOutRequestDTO } from '@/domain/dtos/trainerOutRequest.dto';

export class TrainerController {
  constructor(private getTrainerUseCase: GetTrainerUseCase) {}

  async getTrainer(req: Request, res: Response): Promise<void> {
    try {
      // Assume req.trainer is set by authentication middleware (e.g., JWT)
      const email = req.trainer?.email;
      if (!email) {
        res.status(401).json({ success: false, error: 'Trainer not authenticated' });
        return;
      }

      const result: Result<ITrainerOutRequestDTO> = await this.getTrainerUseCase.execute(email);

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      // Log error for monitoring in a real-world app (e.g., use Winston or Sentry)
      console.error('Unexpected error in getTrainer:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}