import { z } from 'zod';
import { UserSchema } from './user.schema';

export const NotificationTypeEnum = z.enum(['TRANSACTION', 'WALLET_ALERT', 'SECURITY', 'SYSTEM']);
export const NotificationStatusEnum = z.enum(['UNREAD', 'READ', 'ARCHIVED']);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;
export type NotificationStatus = z.infer<typeof NotificationStatusEnum>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeEnum,
  status: NotificationStatusEnum.default('UNREAD'),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NotificationWithRelationsSchema = NotificationSchema.extend({
  user: UserSchema,
});

export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  status: true,
  readAt: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateNotificationSchema = NotificationSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationWithRelations = z.infer<typeof NotificationWithRelationsSchema>;
export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationSchema>;
