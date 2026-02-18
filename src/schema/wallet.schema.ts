import { z } from 'zod';
import { UserSchema } from './user.schema';
import { TransactionSchema } from './transaction.schema';

export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  balance: z.number().nonnegative(),
  currency: z.string().default('USD'),
  version: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WalletWithRelationsSchema = WalletSchema.extend({
  user: UserSchema,
  sentTransactions: z.array(TransactionSchema),
  receivedTransactions: z.array(TransactionSchema),
});

export const CreateWalletSchema = WalletSchema.omit({
  id: true,
  version: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateWalletSchema = WalletSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Wallet = z.infer<typeof WalletSchema>;
export type WalletWithRelations = z.infer<typeof WalletWithRelationsSchema>;
export type CreateWalletDto = z.infer<typeof CreateWalletSchema>;
export type UpdateWalletDto = z.infer<typeof UpdateWalletSchema>;
