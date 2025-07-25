// src/app/controllers/interfaces/IAdminController.ts
import { Request, Response } from 'express';

export interface IAdminController {
  getAdmin(req: Request, res: Response): Promise<void>;
  getUsers(req: Request, res: Response): Promise<void>;
  toggleUserVerification(req: Request, res: Response): Promise<void>;
  getTrainers(req: Request, res: Response): Promise<void>;
  approveTrainer(req: Request, res: Response): Promise<void>;
  getGyms(req: Request, res: Response): Promise<void>;
  addGym(req: Request, res: Response): Promise<void>;
  getAvailableTrainers(req: Request, res: Response): Promise<void>;
  getMembershipPlans(req: Request, res: Response): Promise<void>;
  addMembershipPlan(req: Request, res: Response): Promise<void>;
  getTrainerPTPlans(req: Request, res: Response): Promise<void>;
  verifyPTPlan(req: Request, res: Response): Promise<void>;
  updatePTPlanAdminPrice(req: Request, res: Response): Promise<void>;
}