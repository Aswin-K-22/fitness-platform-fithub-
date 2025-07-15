import { IRedisService } from './redis.service';

export interface ITokenService {
  generateAccessToken(payload: { email: string; id: string | null }): Promise<{ token: string; jti: string }>;
  generateRefreshToken(payload: { email: string; id: string | null }): Promise<string>;
  verifyAccessToken(token: string): Promise<{ email: string; id: string; jti: string }>;
  verifyRefreshToken(token: string): Promise<{ email: string; id: string }>;
  blacklistAccessToken(jti: string): Promise<void>;
}