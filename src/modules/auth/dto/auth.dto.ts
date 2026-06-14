import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from 'src/common/schema';

export const RegisterSchema = z.object({
  identifier: z.union([phoneSchema, emailSchema]),
  password: passwordSchema,
});

export const LoginSchema = z.object({
  identifier: z.union([phoneSchema, emailSchema]),
  password: passwordSchema,
});

// Refresh token input schema
export const RefreshTokenSchema = z.object({
  refreshToken: z.string({
    error: 'Refresh token is required',
  }),
});

// Refresh token input schema
export const SendOtpSchema = z.object({
  identifier: z.union([phoneSchema, emailSchema]),
});

// Refresh token input schema
export const VerifyOtpSchema = z.object({
  identifier: z.union([phoneSchema, emailSchema]),
  code: z.string().max(6),
});

// User response schema
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

// Auth response schema
export const AuthResponseSchema = z.object({
  data: { accessToken: z.string() },
  message: z.string(),
});

// Token response schema
export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type SendOtpDto = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
export type TokenResponseDto = z.infer<typeof TokenResponseSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
