import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { IUsersRepository } from '../../app/repositories/users.repository';
import { ITokenService } from '@/app/providers/token.service';

// Extend Express Request interface to include user
declare module 'express' {
  interface Request {
    user?: { id: string | null; email: string }; // Allow id to be string | null
  }
}

export class AuthMiddleware {
 constructor(
    private usersRepository: IUsersRepository,
    private tokenService: ITokenService
  ) {}

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.cookies?.userAccessToken;
      console.log('Access token received:', accessToken[0]);
      if (!accessToken) {
        res.status(401).json({ success: false, error: 'No access token provided' });
        return;
      }

      // Validate JWT_SECRET environment variable
      const jwtSecret = process.env.JWT_ACCESS_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_ACCESS_SECRET is not defined');
      }

      // Verify JWT token
      const decoded = await this.tokenService.verifyAccessToken(accessToken);

      // Fetch user from repository
      const user = await this.usersRepository.findById(decoded.id);
      if (!user) {
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }

      // Attach user info to request
      req.user = { id: user.id, email: user.email.address };
      next();
    } catch (error) {
      // Log error for monitoring (use a logger like Winston in production)
      console.error('User auth middleware error:');
      res.status(401).json({ success: false, error: 'Invalid or expired access token' });
    }
  }
}