import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CurrentUser, type CurrentUserDto } from 'src/common';
import { WsJwtAuthGuard } from 'src/common/guard/wsJwt.guard';
import { JwtAuthGuard } from 'src/modules/auth/jwt.guard';
import { PrismaService } from 'src/prisma';

@UseGuards(WsJwtAuthGuard)
@WebSocketGateway({
  cors: { origin: '*' },
})
export class DashboardGateway implements OnGatewayInit {
  constructor(private readonly prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;
  private interval;

  sendGlobalMessage() {
    this.interval = setInterval(() => {
      const roomsMap = this.server.sockets.adapter.rooms;
      const sids = this.server.sockets.adapter.sids;

      const roomsInfo: { name: string; users: number }[] = [];

      for (const [roomName, roomSet] of roomsMap) {
        if (!sids.has(roomName)) {
          roomsInfo.push({
            name: roomName,
            users: roomSet.size,
          });
        }
      }

      const sampleData = {
        cpu: (Math.random() * 100).toFixed(1),
        ram: (Math.random() * 100).toFixed(1),
        usersOnline: this.server.engine.clientsCount,
        timestamp: new Date().toISOString(),
        rooms: roomsInfo,
      };

      this.server.emit('dashboardUpdate', sampleData);
    }, 500);
  }

  @SubscribeMessage('Dahsi')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('I Givaeeee messsahe', data, ' clent id ', client.id);
    client.emit('dddd');
    return { status: 'ok', received: data };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() payload: { room: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(payload.room);

    // اطلاع به همه در آن Room که کاربر جدید پیوست
    client
      .to(payload.room)
      .emit('userJoined', `${payload.username} has joined the room.`);

    return {
      event: 'joined',
      data: `Successfully joined room ${payload.room}`,
    };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() payload: { room: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(payload.room);

    // اطلاع به همه در آن Room که کاربر جدید پیوست
    client
      .to(payload.room)
      .emit('LeaveUser', `${payload.username} has been Left the room.`);

    return {
      event: 'joined',
      data: `Successfully joined room ${payload.room}`,
    };
  }

  @SubscribeMessage('sendRoomMessage')
  handleRoomMessage(
    @MessageBody() payload: { room: string; username: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    // ارسال پیام فقط به اعضای روم
    this.server.to(payload.room).emit('newRoomMessage', {
      username: payload.username,
      message: payload.message,
    });

    return { status: 'sent' };
  }

  ///////////////////////////////////////////////////////////////////////////////////////// chat section \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  @SubscribeMessage('joinConversation')
  async handleJoinConv(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(payload.conversationId);

    return { status: 'joined' };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @CurrentUser() user: CurrentUserDto,
    @MessageBody()
    payload: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = user.id;

    // 1) پیام را در DB بساز
    const message = await this.prisma.message.create({
      data: {
        conversationId: payload.conversationId,
        senderId,
        content: payload.content,
      },
    });

    // 2) Conversation را برای lastMessage آپدیت کن
    await this.prisma.conversation.update({
      where: { id: payload.conversationId },
      data: {
        lastMessageId: message.id,
        lastMessageAt: new Date(),
      },
    });

    await this.prisma.conversationMember.updateMany({
      where: {
        conversationId: payload.conversationId,
        userId: { not: senderId },
      },
      data: { unreadCount: { increment: 1 } },
    });

    // 3) پیام را برای کل اعضای Room بفرست
    this.server.to(payload.conversationId).emit('message', {
      id: message.id,
      conversationId: payload.conversationId,
      senderId,
      content: payload.content,
      createdAt: message.createdAt,
    });

    return { status: 'sent' };
  }

  @SubscribeMessage('markAsRead')
  async markAsRead(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: payload.conversationId,
          userId: client.data.userId,
        },
      },
      data: { unreadCount: 0 },
    });
  }

  @SubscribeMessage('loadMessages')
  async loadMessages(
    @MessageBody() payload: { conversationId: string; cursor?: string },
  ) {
    return this.prisma.message.findMany({
      where: { conversationId: payload.conversationId },
      take: 30,
      orderBy: { createdAt: 'desc' },
      cursor: payload.cursor ? { id: payload.cursor } : undefined,
      skip: payload.cursor ? 1 : 0,
      include: { reactions: true },
    });
  }

  afterInit() {
    console.log('Dashboard WebSocket initialized');
    this.sendGlobalMessage();
  }
}
