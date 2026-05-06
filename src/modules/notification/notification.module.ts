import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.contoller';
import { ConfigService } from '@nestjs/config';
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, ConfigService],
  exports: [NotificationService],
})
export class NotificationModule {}
