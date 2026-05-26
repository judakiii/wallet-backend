// conversation.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateConversationDto, ConversationKindEnum } from './dto';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConversationDto, currentUserId: string) {
    const uniqueMemberIds = [...new Set([currentUserId, ...dto.memberIds])];

    if (
      dto.type === ConversationKindEnum.DIRECT &&
      uniqueMemberIds.length !== 2
    ) {
      throw new BadRequestException(
        'DIRECT conversation must have exactly 2 members',
      );
    }

    if (dto.type === ConversationKindEnum.GROUP && uniqueMemberIds.length < 3) {
      throw new BadRequestException(
        'GROUP conversation must have higher 2 members',
      );
    }

    if (
      dto.type === ConversationKindEnum.TICKET &&
      uniqueMemberIds.length !== 2
    ) {
      throw new BadRequestException(
        'TICKET conversation must have exactly 2 members',
      );
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueMemberIds } },
      select: { id: true },
    });

    if (users.length !== uniqueMemberIds.length) {
      throw new BadRequestException('One or more memberIds are invalid');
    }

    // جلوگیری از ساخت direct , ticket تکراری
    if (
      dto.type === ConversationKindEnum.DIRECT ||
      dto.type === ConversationKindEnum.TICKET
    ) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          type: dto.type,
          members: {
            every: {
              userId: { in: uniqueMemberIds },
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (
        existing &&
        existing.members.length === 2 &&
        uniqueMemberIds.every((id) =>
          existing.members.some((m) => m.userId === id),
        )
      ) {
        return existing;
      }
    }

    // جلوگیری از ساخت group تکراری
    if (dto.type === ConversationKindEnum.GROUP) {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          type: 'GROUP',
          members: {
            every: {
              userId: { in: uniqueMemberIds },
            },
          },
        },
        include: {
          members: true,
        },
      });

      if (
        existing &&
        existing.members.length > 2 &&
        uniqueMemberIds.every((id) =>
          existing.members.some((m) => m.userId === id),
        )
      ) {
        return existing;
      }
    }

    return this.prisma.conversation.create({
      data: {
        type: dto.type,
        title: dto.title,
        members: {
          create: uniqueMemberIds.map((userId) => ({
            userId,
            role: 'MEMBER',
          })),
        },
      },
      include: {
        members: true,
      },
    });
  }

  async addReaction(
    body: { messageId: string; emoji: string },
    userId: string,
  ) {
    return this.prisma.messageReaction.create({
      data: {
        userId,
        emoji: body.emoji,
        messageId: body.messageId,
      },
    });
  }

  async findMine(currentUserId: string) {
    return this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
            unreadCount: true,
            joinedAt: true,
          },
        },
        // lastMessage: true,
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }

  async findConversationMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        reactions: {
          select: {
            userId: true,
            emoji: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async updateMessage(conversationId: string, content: string) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        reactions: {
          select: {
            userId: true,
            emoji: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async deleteMessages(messageId: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'delete was successfully',
    };
  }

  // async findOne(conversationId: string, currentUserId: string) {
  //   const conv = await this.prisma.conversation.findFirst({
  //     where: {
  //       id: conversationId,
  //       members: {
  //         some: { userId: currentUserId },
  //       },
  //     },
  //     include: {
  //       members: true,
  //       lastMessage: true,
  //     },
  //   });

  //   if (!conv) {
  //     throw new NotFoundException('Conversation not found');
  //   }

  //   return conv;
  // }

  // async addMember(
  //   conversationId: string,
  //   memberId: string,
  //   currentUserId: string,
  // ) {
  //   const conv = await this.prisma.conversation.findFirst({
  //     where: {
  //       id: conversationId,
  //       members: {
  //         some: { userId: currentUserId },
  //       },
  //     },
  //     select: { id: true, type: true },
  //   });

  //   if (!conv) {
  //     throw new NotFoundException('Conversation not found');
  //   }

  //   if (conv.type === 'DIRECT') {
  //     throw new BadRequestException('Cannot add member to DIRECT conversation');
  //   }

  //   return this.prisma.conversationMember.create({
  //     data: {
  //       conversationId,
  //       userId: memberId,
  //     },
  //   });
  // }

  // async removeMember(
  //   conversationId: string,
  //   memberId: string,
  //   currentUserId: string,
  // ) {
  //   const isRequesterMember = await this.prisma.conversationMember.findFirst({
  //     where: {
  //       conversationId,
  //       userId: currentUserId,
  //     },
  //   });

  //   if (!isRequesterMember) {
  //     throw new ForbiddenException('Access denied');
  //   }

  //   return this.prisma.conversationMember.delete({
  //     where: {
  //       conversationId_userId: {
  //         conversationId,
  //         userId: memberId,
  //       },
  //     },
  //   });
  // }
}
