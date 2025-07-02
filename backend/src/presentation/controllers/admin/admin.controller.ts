import { Request, Response } from 'express';
import { GetAdminUseCase } from '@/app/useCases/getAdmin.useCase';

export class AdminController {
  constructor(private getAdminUseCase: GetAdminUseCase) {}

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
}