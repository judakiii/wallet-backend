// conversation.module.ts
import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.contoller';
import { ConversationService } from './conversation.service';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
