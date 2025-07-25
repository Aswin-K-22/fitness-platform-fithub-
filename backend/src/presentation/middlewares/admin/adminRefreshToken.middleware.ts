import { Request, Response, NextFunction } from 'express';
import { IUsersRepository } from '@/app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';
import { UserErrorType } from '@/domain/enums/userErrorType.enum';
import { AuthErrorType } from '@/domain/enums/authErrorType.enum';

export const adminRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  usersRepository: IUsersRepository,
  tokenService: ITokenService,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: UserErrorType.NoRefreshToken });
      return;
    }

    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    const user = await usersRepository.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: UserErrorType.UserNotFound });
      return;
    }

    if (user.role !== 'admin') {
      res.status(401).json({ message: AuthErrorType.InvalidRole });
      return;
    }

    if (user.refreshToken !== refreshToken) {
      res.status(401).json({ message: AuthErrorType.InvalidRefreshToken });
      return;
    }

    req.admin = { id: user.id!, email: user.email.address };
    next();
  } catch (error) {
    res.status(401).json({ message: AuthErrorType.InvalidRefreshToken });
  }
};