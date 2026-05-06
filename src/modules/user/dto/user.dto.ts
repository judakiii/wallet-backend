import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from 'src/common/schema';

export const UserUpdateSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UserUpdateDto = z.infer<typeof UserUpdateSchema>;
