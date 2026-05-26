import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import * as fs from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Injectable()
export class AttachmentsServiceV1 {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: Express.Multer.File) {
    const attachment = await this.prisma.attachment.create({
      data: {
        url: `/uploads/attachments/${file.filename}`,
        key: `attachments/${file.filename}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return attachment;
  }

  async download(filename: string, res: Response) {
    const filePath = join(process.cwd(), 'uploads/attachments', filename);
    return res.download(filePath);
  }

  async delete(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const filePath = join(process.cwd(), attachment.url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.attachment.delete({
      where: { id },
    });

    return { success: true };
  }
}
