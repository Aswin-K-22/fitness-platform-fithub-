export interface IRedisService {
  storeAccessToken(jti: string, ttl: number): Promise<void>;
  isTokenBlacklisted(jti: string): Promise<boolean>;
  blacklistToken(jti: string, ttl: number): Promise<void>;
}