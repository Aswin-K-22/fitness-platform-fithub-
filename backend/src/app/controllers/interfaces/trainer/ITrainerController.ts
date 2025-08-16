import { Request, Response } from 'express';

export interface ITrainerController {
  getTrainer(req: Request, res: Response): Promise<void>;
  getTrainerProfile(req: Request, res: Response): Promise<void>;
  updateTrainerProfile(req: Request, res: Response): Promise<void>;
  createPTPlan(req: Request, res: Response): Promise<void>;
  getPTPlans(req: Request, res: Response): Promise<void>;
  editPTPlan(req: Request, res: Response): Promise<void>;
  stopPTPlan(req: Request, res: Response): Promise<void>;
  resumePTPlan(req: Request, res: Response): Promise<void>;
  getTrainerNotifications(req: Request, res: Response): Promise<void>;
  markTrainerNotificationRead(req: Request, res: Response): Promise<void>;
  getUsersForTrainerPlans(req: Request, res: Response): Promise<void>;

}