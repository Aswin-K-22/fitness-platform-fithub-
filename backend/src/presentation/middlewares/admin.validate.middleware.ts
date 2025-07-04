// src/presentation/middlewares/admin.validate.middleware.ts
import { GetAdminGymsRequestSchema } from '@/domain/dtos/getAdminGymsRequest.dto';
import { GetAdminMembershipPlansRequestSchema } from '@/domain/dtos/getAdminMembershipPlansRequest.dto';
import { AddMembershipPlanRequestSchema } from '@/domain/dtos/IAddMembershipPlanRequestDTO';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Existing schemas (assumed)
const signupSchema = z.object({ /* existing schema */ });
const loginSchema = z.object({ /* existing schema */ });
const googleAuthSchema = z.object({ /* existing schema */ });
const resendOtpSchema = z.object({ /* existing schema */ });
const forgotPasswordSchema = z.object({ /* existing schema */ });
const verifyOtpSchema = z.object({ /* existing schema */ });
const resetPasswordSchema = z.object({ /* existing schema */ });
const refreshTokenSchema = z.object({ /* existing schema */ });

// New schemas for admin
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const adminRefreshTokenSchema = z.object({
  refreshToken: z.string().nonempty('Refresh token is required'),
});

const schemas = {
  getAdminGyms: GetAdminGymsRequestSchema,
  adminLogin: adminLoginSchema,
  adminRefreshToken: adminRefreshTokenSchema,
 getAdminMembershipPlans: GetAdminMembershipPlansRequestSchema,
 addMembershipPlan: AddMembershipPlanRequestSchema,
};

export const validateMiddleware = (schemaName: keyof typeof schemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = schemas[schemaName];
      if (!schema) {
        res.status(400).json({ message: 'Invalid validation schema' });
        return;
      }
      schema.parse({
        ...req.body,
        ...req.query,
      });
      next();
    } catch (error) {
      res.status(400).json({ message: 'Validation failed', error: (error as any).errors });
    }
  };
};