import { Request, Response } from 'express';
import { GetTrainerUseCase } from '@/app/useCases/getTrainer.useCase';
import { GetTrainerProfileUseCase } from '@/app/useCases/getTrainerProfile.useCase';
import { TrainerErrorType } from '@/domain/enums/trainerErrorType.enum';
import { UpdateTrainerProfileUseCase } from '@/app/useCases/updateTrainerProfile.useCase';
import { IUpdateTrainerProfileRequestDTO } from '@/domain/dtos/updateTrainerProfileRequest.dto';

export class TrainerController {
  constructor(
    private getTrainerUseCase: GetTrainerUseCase,
    private getTrainerProfileUseCase: GetTrainerProfileUseCase,
    private updateTrainerProfileUseCase: UpdateTrainerProfileUseCase
  ) {}

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
      res.status(500).json({ success: false, error: error.message || TrainerErrorType.InternalServerError });
    }
  }

  async getTrainerProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.trainer?.email) {
        console.log('[DEBUG] Trainer not authenticated');
        res.status(401).json({ success: false, error: TrainerErrorType.NOT_AUTHENTICATED });
        return;
      }

      const result = await this.getTrainerProfileUseCase.execute(req.trainer.email);
      if (!result.success) {
        res.status(result.error === TrainerErrorType.TrainerNotFound ? 404 : 500).json({
          success: false,
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        trainer: result.trainer,
      });
    } catch (error: any) {
      console.error('[ERROR] Get trainer profile error:', error);
      res.status(500).json({ success: false, error: TrainerErrorType.InternalServerError });
    }
  }

 async updateTrainerProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.trainer?.email) {
        console.log('[DEBUG] Trainer not authenticated');
        res.status(401).json({ success: false, error: TrainerErrorType.NOT_AUTHENTICATED });
        return;
      }

      const data: IUpdateTrainerProfileRequestDTO = {
        name: req.body.name || undefined,
        bio: req.body.bio || undefined,
        specialties: req.body.specialties ? JSON.parse(req.body.specialties) : undefined,
        profilePic: req.file,
        upiId: req.body.upiId || undefined,
        bankAccount: req.body.bankAccount || undefined,
        ifscCode: req.body.ifscCode || undefined,
      };

      const result = await this.updateTrainerProfileUseCase.execute(req.trainer.email, data);
      if (!result.success) {
        const status = result.error === TrainerErrorType.TrainerNotFound ? 404 :
                       result.error === TrainerErrorType.NoValidFieldsProvided ? 400 :
                       result.error === TrainerErrorType.InvalidName ||
                       result.error === TrainerErrorType.InvalidBio ||
                       result.error === TrainerErrorType.InvalidSpecialties ||
                       result.error === TrainerErrorType.InvalidUpiId ||
                       result.error === TrainerErrorType.InvalidBankAccount ||
                       result.error === TrainerErrorType.InvalidIfscCode ||
                       result.error === TrainerErrorType.MissingBankDetails ? 400 : 500;
        res.status(status).json({
          success: false,
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        trainer: result.trainer,
      });
    } catch (error: any) {
      console.error('[ERROR] Update trainer profile error:', error);
      res.status(500).json({ success: false, error: TrainerErrorType.InternalServerError });
    }
  }
}