import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, type CurrentUserDto } from 'src/common';
import { UserUpdateSchema, type UserUpdateDto } from './dto/user.dto';
import { ZodValidation } from 'src/common/pipes';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getInfo(@CurrentUser() user: CurrentUserDto) {
    return this.userService.getInfo(user.id);
  }

  @Patch('')
  @UsePipes(ZodValidation(UserUpdateSchema))
  async update(
    @Body() body: UserUpdateDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.userService.update(user.id, body);
  }
}
