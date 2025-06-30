import { Request, Response, NextFunction } from 'express';

export const refreshTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const refreshToken = req.cookies?.userRefreshToken;
    console.log('Refresh token received in middleware:', refreshToken? refreshToken[0]: refreshToken);

    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'No refresh token provided in cookies' });
      return;
    }

    // Set refreshToken in req.body for compatibility with RefreshTokenUseCase
    req.body = { refreshToken };
    next();
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    res.status(400).json({ success: false, error: 'Invalid refresh token' });
  }
};