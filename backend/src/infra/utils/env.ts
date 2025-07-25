// src/infra/utils/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ORIGIN: z.string().url({ message: 'ORIGIN must be a valid URL' }).default('http://localhost:5173'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error('REDIS_PORT must be a valid number');
    }
    return parsed;
  }).refine((val) => val >= 1 && val <= 65535, {
    message: 'REDIS_PORT must be a valid port number between 1 and 65535',
  }).default('6379'),
  JWT_ACCESS_SECRET: z.string().min(10, { message: 'JWT_ACCESS_SECRET must be at least 10 characters' }),
  JWT_REFRESH_SECRET: z.string().min(10, { message: 'JWT_REFRESH_SECRET must be at least 10 characters' }),
  EMAIL_USER: z.string().email({ message: 'EMAIL_USER must be a valid email' }).optional(),
  EMAIL_PASS: z.string().min(1, { message: 'EMAIL_PASS is required if EMAIL_USER is provided' }).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1, { message: 'GOOGLE_CLIENT_ID is required for Google OAuth' }).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1, { message: 'GOOGLE_CLIENT_SECRET is required for Google OAuth' }).optional(),
  GOOGLE_CALLBACK_URL: z.string().url({ message: 'GOOGLE_CALLBACK_URL must be a valid URL' }).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1, { message: 'AWS_ACCESS_KEY_ID is required for AWS services' }).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, { message: 'AWS_SECRET_ACCESS_KEY is required for AWS services' }).optional(),
  AWS_REGION: z.string().min(1, { message: 'AWS_REGION is required for AWS services' }).optional(),
  AWS_S3_BUCKET: z.string().min(1, { message: 'AWS_S3_BUCKET is required for AWS S3' }).optional(),
  OTP_EXPIRES_SECONDS: z.string().transform(Number).refine((val) => val > 0, {
    message: 'OTP_EXPIRES_SECONDS must be a positive number',
  }).optional().default('30'),
  RAZORPAY_KEY_ID: z.string().min(1, { message: 'RAZORPAY_KEY_ID is required for Razorpay' }).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1, { message: 'RAZORPAY_KEY_SECRET is required for Razorpay' }).optional(),
});

const env = envSchema.parse(process.env);

export default env;