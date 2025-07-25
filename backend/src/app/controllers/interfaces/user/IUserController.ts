import { Request, Response } from 'express';

export interface IUserController {
  getUser(req: Request, res: Response): Promise<void>;
  getUserProfile(req: Request, res: Response): Promise<void>;
  updateUserProfile(req: Request, res: Response): Promise<void>;
  getGyms(req: Request, res: Response): Promise<void>;
  getGymDetails(req: Request, res: Response): Promise<void>;
  getMembershipPlans(req: Request, res: Response): Promise<void>;
  initiateMembershipPayment(req: Request, res: Response): Promise<void>;
  verifyMembershipPayment(req: Request, res: Response): Promise<void>;
  getNotifications(req: Request, res: Response): Promise<void>;
  markNotificationRead(req: Request, res: Response): Promise<void>;
}