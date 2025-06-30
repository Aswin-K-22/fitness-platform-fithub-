export interface ITokenService {
  generateAccessToken(payload: { email: string; id: string | null}): Promise<string>;
  generateRefreshToken(payload: { email: string; id: string | null}): Promise<string>;
  verifyAccessToken(token: string): Promise<{ email: string; id: string }>;
  verifyRefreshToken(token: string): Promise<{ email: string; id: string }>;
}