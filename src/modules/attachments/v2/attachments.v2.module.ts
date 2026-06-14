import { Module } from '@nestjs/common';
import { AttachmentsServiceV2 } from './attachments.v2.service';
import { AttachmentsControllerV2 } from './attachments.v2.controller';

@Module({
  controllers: [AttachmentsControllerV2],
  providers: [AttachmentsServiceV2],
})
export class AttachmentsModuleV2 {}
