import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ITrainersRepository } from '../../app/repositories/trainers.repository';

// Extend Express Request interface to include trainer
declare module 'express' {
  interface Request {
    trainer?: { id: string | null; email: string }; // Allow id to be string | null
  }
}

export class TrainerAuthMiddleware {
  constructor(private trainersRepository: ITrainersRepository) {}

  async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.cookies?.trainerAccessToken;
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
      const decoded = jwt.verify(accessToken, jwtSecret) as {
        email: string;
        id: string;
      };

      // Fetch trainer from repository
      const trainer = await this.trainersRepository.findById(decoded.id);
      if (!trainer) {
        res.status(401).json({ success: false, error: 'Trainer not found' });
        return;
      }

      // Attach trainer info to request
      req.trainer = { id: trainer.id, email: trainer.email.address };
      next();
    } catch (error) {
      // Log error for monitoring (use a logger like Winston in production)
      console.error('Trainer auth middleware error:', error);
      res.status(401).json({ success: false, error: 'Invalid or expired access token' });
    }
  }
}