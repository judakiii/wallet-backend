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

import { AttachmentsServiceV1 } from './attachments.v1.service';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { type Response } from 'express';

@Controller('attachments/v1')
export class AttachmentsControllerV1 {
  constructor(private readonly attachmentsService: AttachmentsServiceV1) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/attachments'),
        filename: (req, file, cb) => {
          const fileName = randomUUID() + extname(file.originalname);
          cb(null, fileName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.attachmentsService.create(file);
  }

  @Get(':filename')
  download(@Param('filename') filename: string, @Res() res: Response) {
    return this.attachmentsService.download(filename, res);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.attachmentsService.delete(id);
  }
}
