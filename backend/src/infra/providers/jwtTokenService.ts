//src/infra/providers/jwtTokenService.ts
import { ITokenService } from '@/app/providers/token.service';
import { IRedisService } from '@/app/providers/redis.service';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class JwtTokenService implements ITokenService {
  private readonly accessSecret = process.env.JWT_SECRET || 'access_secret';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  private readonly accessTokenTTL = 15 * 60; // 15 minutes in seconds

  constructor(private redisService: IRedisService) {}

  async generateAccessToken(payload: { email: string; id: string | null }): Promise<{ token: string; jti: string }> {
    const jti = uuidv4();
    const token = jwt.sign({ ...payload, jti }, this.accessSecret, { expiresIn: '15m' });
    await this.redisService.storeAccessToken(jti, this.accessTokenTTL);
    return { token, jti };
  }

 async generateRefreshToken(payload: { email: string; id: string | null }): Promise<string> {
  if (!payload.email || !payload.id) {
    throw new Error(`Invalid payload: email=${payload.email}, id=${payload.id}`);
  }
  console.log('[DEBUG] Refresh token payload:', payload);
  return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
}

  async verifyAccessToken(token: string): Promise<{ email: string; id: string; jti: string }> {
    const decoded = jwt.verify(token, this.accessSecret) as { email: string; id: string; jti: string };
    const isBlacklisted = await this.redisService.isTokenBlacklisted(decoded.jti);
    if (isBlacklisted) {
      throw new Error('Token is blacklisted');
    }
    return decoded;
  }

  async verifyRefreshToken(token: string): Promise<{ email: string; id: string }> {
    const decoded = jwt.verify(token, this.refreshSecret);
    console.log('Decoded token:-infra/provide/jwtTokenServie -verify fresher Token', decoded); 
    return decoded as { email: string; id: string };
  }

  async blacklistAccessToken(jti: string): Promise<void> {
    await this.redisService.blacklistToken(jti, this.accessTokenTTL);
  }
}