import { Request, Response, NextFunction } from 'express';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';

declare module 'express' {
  interface Request {
    user?: { id: string | null; email: string };
  }
}

export class AuthMiddleware {
  constructor(private usersRepository: IUsersRepository, private tokenService: ITokenService) {}

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.cookies?.userAccessToken;
      if (!accessToken) {
        res.status(401).json({ success: false, error: 'No access token provided' });
        return;
      }

      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      const user = await this.usersRepository.findById(decoded.id);
      if (!user) {
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }

      req.user = { id: user.id, email: user.email.address };
      next();
    } catch (error) {
      console.error('User auth middleware error:', error);
      res.status(401).json({ success: false, error: 'Invalid or blacklisted access token' });
    }
  }
}