import { ITokenService } from '../../app/providers/token.service';
import * as jwt from 'jsonwebtoken';

export class JwtTokenService implements ITokenService {
  private readonly accessSecret = process.env.JWT_SECRET || 'access_secret';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

  async generateAccessToken(payload: { email: string; id: string }): Promise<string> {
    return jwt.sign(payload, this.accessSecret, { expiresIn: '15m' });
  }

  async generateRefreshToken(payload: { email: string; id: string }): Promise<string> {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
  }

  async verifyAccessToken(token: string): Promise<{ email: string; id: string }> {
    console.log('Verifying access token:', token[0]);
    return jwt.verify(token, this.accessSecret) as { email: string; id: string };
  }
  async verifyRefreshToken(token: string): Promise<{ email: string; id: string }> {
    console.log('Decoding  refresh token:', token[0]);
    return jwt.verify(token, this.refreshSecret) as { email: string; id: string };
  }
}