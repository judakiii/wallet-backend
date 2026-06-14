import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.contoller';
import { UserRepository } from './repositories';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
