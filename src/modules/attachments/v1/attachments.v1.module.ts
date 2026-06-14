import { Module } from '@nestjs/common';
import { AttachmentsControllerV1 } from './attachments.v1.controller';
import { AttachmentsServiceV1 } from './attachments.v1.service';

@Module({
  controllers: [AttachmentsControllerV1],
  providers: [AttachmentsServiceV1],
})
export class AttachmentsModuleV1 {}
