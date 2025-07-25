import { Request, Response, NextFunction } from 'express';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { AuthErrorType } from '@/domain/enums/authErrorType.enum';
import { console } from 'inspector';

declare module 'express' {
  interface Request {
    admin?: { email: string; id: string };
  }
}

export class AdminAuthMiddleware {
  constructor(
    private usersRepository: IUsersRepository,
    private tokenService: ITokenService,
  ) {}

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.cookies?.adminAccessToken;
      console.log('Admin middle waere lat ',1)
      if (!accessToken) {
        res.status(401).json({ message: UserErrorType.NoAccessToken });
        return;
      }
console.log('Admin middle waere lat ',2)
      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      const user = await this.usersRepository.findByEmail(decoded.email);
      if (!user) {
        res.status(401).json({ message: UserErrorType.UserNotFound });
        return;
      }
console.log('Admin middle waere lat ',3)
      if (user.role !== 'admin') {
        res.status(401).json({ message: AuthErrorType.InvalidRole });
        return;
      }
console.log('Admin middle waere lat ',user)
      req.admin = { id: user.id!, email: user.email.address };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or blacklisted access token' });
    }
  }
}