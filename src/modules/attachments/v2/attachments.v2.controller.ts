import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsServiceV2 } from './attachments.v2.service';
import { type Response } from 'express';

@Controller('attachments/v2')
export class AttachmentsControllerV2 {
  constructor(private readonly attachmentsService: AttachmentsServiceV2) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // بدون diskStorage => buffer در دسترسه
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.attachmentsService.create(file);
  }

  @Get(':key')
  async getfile(@Param('key') key: string, @Res() res: Response) {
    return this.attachmentsService.getfile(key, res);
  }

  @Delete(':key')
  async deletefile(@Param('key') key: string) {
    return this.attachmentsService.deletefile(key);
  }
}
