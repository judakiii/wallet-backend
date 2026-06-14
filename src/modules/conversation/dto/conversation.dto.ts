import { z } from 'zod';

export enum ConversationKindEnum {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  TICKET = 'TICKET',
}

export const CreateConversationSchema = z.object({
  type: z.enum(ConversationKindEnum),
  title: z.string().min(3),
  memberIds: z.array(z.string().uuid()).min(1),
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;
