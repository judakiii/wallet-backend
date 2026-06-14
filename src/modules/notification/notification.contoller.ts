import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send_sms')
  sendSms(@Body() body: { phone: string }) {
    return this.notificationService.sendSms(body.phone, '202020');
  }
}

// otp service : 1-send-otp 2-verifyotp
