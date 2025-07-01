export interface IPasswordHasher {
  hashPassword(password: string): Promise<string>;
  comparePasswords(plainPassword: string, hashedPassword: string | null): Promise<boolean>;
}