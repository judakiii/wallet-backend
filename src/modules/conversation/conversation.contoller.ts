import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  Delete,
  Patch,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, type CurrentUserDto } from 'src/common';
import { type CreateConversationDto } from './dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  createConversation(
    @Body() body: CreateConversationDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.conversationService.create(body, user.id);
  }

  @Post('addReaction')
  addReaction(
    @Body() body: { messageId: string; emoji: string },
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.conversationService.addReaction(body, user.id);
  }

  @Get()
  findMine(@CurrentUser() user: CurrentUserDto) {
    return this.conversationService.findMine(user.id);
  }

  @Get('/messages/:id')
  findConversationMessages(
    @Param('id') id: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: number,
  ) {
    return this.conversationService.findConversationMessages(id, {
      cursor,
      limit,
    });
  }

  @Patch('/messages/:id')
  updateMessage(@Param('id') id: string) {
    return this.conversationService.deleteMessages(id);
  }

  @Delete('/messages/:id')
  deleteMessage(@Param('id') id: string) {
    return this.conversationService.deleteMessages(id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserDto) {
  //   return this.conversationService.findOne(id, user.id);
  // }

  // @Post(':id/members')
  // addMember(
  //   @Param('id') id: string,
  //   @Body() body: { memberId: string },
  //   @CurrentUser() user: CurrentUserDto,
  // ) {
  //   return this.conversationService.addMember(id, body.memberId, user.id);
  // }

  // @Delete(':id/members/:memberId')
  // removeMember(
  //   @Param('id') id: string,
  //   @Param('memberId') memberId: string,
  //   @CurrentUser() user: CurrentUserDto,
  // ) {
  //   return this.conversationService.removeMember(id, memberId, user.id);
  // }
}
