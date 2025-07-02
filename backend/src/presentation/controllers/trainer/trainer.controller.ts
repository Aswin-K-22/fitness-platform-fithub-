import { Request, Response } from 'express';
import { GetTrainerUseCase } from '@/app/useCases/getTrainer.useCase';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';

export class TrainerController {
  constructor(private getTrainerUseCase: GetTrainerUseCase) {}

  async getTrainer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.trainer?.email) {
        console.log('[DEBUG] Trainer not authenticated');
        res.status(401).json({ success: false, error: TrainerErrorType.NOT_AUTHENTICATED });
        return;
      }

      const result = await this.getTrainerUseCase.execute(req.trainer.email);
      res.status(200).json({ success: true, trainer: result.trainer });
    } catch (error: any) {
      console.error('[ERROR] Get trainer error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
}