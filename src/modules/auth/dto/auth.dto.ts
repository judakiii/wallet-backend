import { z } from 'zod';
import { nameSchema , emailSchema , passwordSchema } from 'src/common/schema';

export const RegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

// User response schema
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

// Auth response schema
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

// Token response schema
export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Refresh token input schema
export const RefreshTokenSchema = z.object({
  refreshToken: z.string({
    error: 'Refresh token is required',
  }),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
export type TokenResponseDto = z.infer<typeof TokenResponseSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;