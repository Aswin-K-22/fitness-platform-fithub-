import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';



// Zod schemas for DTO validation
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional().default('user'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const logoutSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const googleAuthSchema = z.object({
  code: z.string().min(1, 'Google auth code is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const createTrainerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional().default('trainer'),
  specialties: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  bio: z.string().optional(),
  certifications: z.array(z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    dateEarned: z.string().optional(),
    filePath: z.string().optional(),
  })).optional(),
});

const loginTrainerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const logoutTrainerSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyTrainerOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resendTrainerOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const validateMiddleware = (
  schema:
    | 'signup'
    | 'login'
    | 'logout'
    | 'googleAuth'
    | 'refreshToken'
    | 'resendOtp'
    | 'forgotPassword'
    | 'verifyOtp'
    | 'resetPassword'
    | 'signupTrainer'
    | 'loginTrainer'
    | 'logoutTrainer'
    | 'verifyTrainerOtp'
    | 'resendTrainerOtp'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    let zodSchema;
    switch (schema) {
      case 'signup':
        zodSchema = createUserSchema;
        break;
      case 'login':
        zodSchema = loginSchema;
        break;
      case 'logout':
        zodSchema = logoutSchema;
        break;
      case 'googleAuth':
        zodSchema = googleAuthSchema;
        break;
      case 'refreshToken':
        zodSchema = refreshTokenSchema;
        break;
      case 'resendOtp':
        zodSchema = resendOtpSchema;
        break;
      case 'forgotPassword':
        zodSchema = forgotPasswordSchema;
        break;
      case 'verifyOtp':
        zodSchema = verifyOtpSchema;
        break;
      case 'resetPassword':
        zodSchema = resetPasswordSchema;
        break;
      case 'signupTrainer':
        zodSchema = createTrainerSchema;
        break;
      case 'loginTrainer':
        zodSchema = loginTrainerSchema;
        break;
      case 'logoutTrainer':
        zodSchema = logoutTrainerSchema;
        break;
      case 'verifyTrainerOtp':
        zodSchema = verifyTrainerOtpSchema;
        break;
      case 'resendTrainerOtp':
        zodSchema = resendTrainerOtpSchema;
        break;
      default:
        res.status(400).json({ message: 'Invalid schema' });
        return;
    }

    try {
      zodSchema.parse(req.body);
      next();
    } catch (error) {
      const errorMessages = (error as z.ZodError).errors.map(err => err.message).join(', ');
      console.log('Error in your Validate-Middleware.ts file ')
      res.status(400).json({ message: `Validation error: ${errorMessages}` });
    }
  };
};