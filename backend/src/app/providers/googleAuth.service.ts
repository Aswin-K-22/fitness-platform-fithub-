export interface IGoogleAuthService {
  verifyCode(code: string): Promise<{ email: string; name?: string }>;
}