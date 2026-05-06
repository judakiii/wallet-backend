import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(6),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const RefreshTokenSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tokenHash: z.string().min(1),
  expiresAt: z.date(),
  revoked: z.boolean().default(false),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
