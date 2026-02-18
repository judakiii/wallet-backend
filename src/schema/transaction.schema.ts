import { z } from 'zod';
import { WalletSchema } from './wallet.schema';

export const TransactionTypeEnum = z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']);
export const TransactionStatusEnum = z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);

export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  fromWalletId: z.string().uuid().optional(),
  toWalletId: z.string().uuid().optional(),
  amount: z.number().positive(),
  fee: z.number().nonnegative().default(0),
  type: TransactionTypeEnum,
  status: TransactionStatusEnum.default('PENDING'),
  description: z.string().optional(),
  idempotencyKey: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  failureReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TransactionWithRelationsSchema = TransactionSchema.extend({
  fromWallet: WalletSchema.optional(),
  toWallet: WalletSchema.optional(),
});

export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTransactionSchema = TransactionSchema.omit({
  id: true,
  fromWalletId: true,
  toWalletId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionWithRelations = z.infer<typeof TransactionWithRelationsSchema>;
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
