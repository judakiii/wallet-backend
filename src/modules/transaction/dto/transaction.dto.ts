import { z } from 'zod';
import { emailSchema, phoneSchema } from 'src/common/schema';

export const TransferSchema = z.object({
  identifier: z.union([phoneSchema, emailSchema]),
  amount: z.number(),
  description: z.string().optional(),
});

export type TransferDto = z.infer<typeof TransferSchema>;
