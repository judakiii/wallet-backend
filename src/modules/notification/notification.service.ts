import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationService {
  constructor(private readonly configService: ConfigService) {}

  // Just Send Command
  // Send Solo Message
  async sendSms(phone: string, code: string) {
    let data = JSON.stringify({
      mobile: phone,
      templateId: this.configService.get<string>('SMS_TEMPLATE'),
      parameters: [{ name: 'Code', value: code }],
    });

    let config = {
      method: 'post',
      url: this.configService.get<string>('SMS_API_VERIFY'),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        'x-api-key': this.configService.get<string>('SMS_API_KEY'),
      },
      data: data,
    };

    return await axios(config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  }

  // Send Group Message
  async sendGroupSms(phoneLst: Array<string>, sendDateTime?: Date) {
    let data = JSON.stringify({
      lineNumber: this.configService.get<string>('SMS_NUMBER'),
      mobiles: [...phoneLst],
      messageText: 'This is Message for Allow To Users That We Alive',
      sendDateTime, // empty = now
    });

    let config = {
      method: 'post',
      url: this.configService.get<string>('SMS_API'),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        'x-api-key': this.configService.get<string>('SMS_API_KEY'),
      },
      data: data,
    };

    return await axios(config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  }

  // Send Group by Group Message
  async sendGroupByGroupSms(phoneLst: Array<string>, sendDateTime?: Date) {
    let data = JSON.stringify({
      lineNumber: this.configService.get<string>('SMS_NUMBER'),
      mobiles: [...phoneLst],
      messageTexts: ['Your Text 1', 'Your Text 2'],
      SendDateTime: sendDateTime, // null = now
    });

    let config = {
      method: 'post',
      url: this.configService.get<string>('SMS_API_LIKE_TO_LIKE'),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        'x-api-key': this.configService.get<string>('SMS_API_KEY'),
      },
      data: data,
    };

    return await axios(config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  }

  // Delete Schedules Messages
  async deleteScheduleMessage(
    phoneLst: Array<string>,
    packId: string,
    sendDateTime?: Date,
  ) {
    let data = JSON.stringify({
      lineNumber: this.configService.get<string>('SMS_NUMBER'),
      mobiles: [...phoneLst],
      messageTexts: ['Your Text 1', 'Your Text 2'],
      SendDateTime: sendDateTime, // null = now
    });

    let config = {
      method: 'delete',
      url: `${this.configService.get<string>('SMS_API_SCHEDULED')}/:${packId}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        'x-api-key': this.configService.get<string>('SMS_API_KEY'),
      },
      data: data,
    };

    return await axios(config)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  }

  // Just Read and get report
}
