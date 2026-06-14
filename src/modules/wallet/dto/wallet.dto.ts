import { z } from 'zod';
import { emailSchema, phoneSchema } from 'src/common/schema';

export const UpdateWalletSchema = z.object({
  identifier: z.union([phoneSchema, emailSchema]),
  balance: z.number().optional(),
  currency: z.enum(['USD', 'RIAL', 'UWAN']).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateWalletDto = z.infer<typeof UpdateWalletSchema>;
