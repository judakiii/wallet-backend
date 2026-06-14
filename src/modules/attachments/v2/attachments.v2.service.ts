import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  DeleteBucketCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { type Response } from 'express';
import { Readable } from 'stream';

@Injectable()
export class AttachmentsServiceV2 {
  private s3: S3Client;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Setup and Auth to AbrArvan
    this.s3 = new S3Client({
      region: this.configService.get('ARVAN_S3_REGION'),
      endpoint: this.configService.get('ARVAN_S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get('ARVAN_S3_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('ARVAN_S3_SECRET_ACCESS_KEY')!,
      },
    });
  }

  // Create Bucket
  async createBucket() {
    const data = await this.s3.send(
      new CreateBucketCommand({
        Bucket: 'sample-bucket',
        ACL: 'public-read', // 'private' | 'public-read'
      }),
    );

    return data;
  }

  // Exist Bucket
  async existBucket() {
    const data = await this.s3.send(
      new HeadBucketCommand({
        Bucket: 'sample-bucket',
      }),
    );
    return data;
  }

  // List of Bucket
  async bucketsList() {
    const data = await this.s3.send(new ListBucketsCommand({}));
    return data;
  }

  //... You Can Develop it From https://docs.arvancloud.ir/fa/developer-tools/sdk/object-storage

  // Delete Bucket
  // قبل از حذف صندوقچه، لازم است ابتدا تمام آبجکت‌های آن را حذف کنید.
  async deleteBucket() {
    const data = await this.s3.send(
      new DeleteBucketCommand({
        Bucket: 'sample-bucket',
      }),
    );
    return data;
  }

  async create(file: Express.Multer.File) {
    const ext = extname(file.originalname); // مثل ".png"
    const key = `attachments/${randomUUID()}${ext}`; // مثلاً attachments/8c1c0d7e.png
    console.log('EXT / KEY : ', ext, '  ', key);
    // آپلود به Arvan S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.configService.get('ARVAN_S3_BUCKET'),
        Key: key,
        Body: file.buffer, // چون Multer باید در memory ذخیره کند
        ContentType: file.mimetype,
        ContentLength: file.size,
        ACL: 'public-read', // اگر فایل‌ها public هستند
      }),
    );

    const url = `${this.configService.get('ARVAN_S3_PUBLIC_BASE_URL')}/${key}`;

    const attachment = await this.prisma.attachment.create({
      data: {
        url, // برای فرانت
        key, // برای delete و مدیریت
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return attachment;
  }

  async getfile(id: string, res: Response) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) throw new NotFoundException();
    console.log('ATTACH : ', attachment);

    const command = new GetObjectCommand({
      Bucket: this.configService.get('ARVAN_S3_BUCKET'),
      Key: attachment.key,
    });

    const data = await this.s3.send(command);

    if (!data.Body) {
      throw new Error('File body is empty');
    }

    res.setHeader(
      'Content-Type',
      data.ContentType || 'application/octet-stream',
    );

    // download and showing "attachment" | "inline"
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${attachment.key.split('/').pop()}"`,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${attachment.key.split('/').pop()}"`,
    );

    (data.Body as Readable).pipe(res);
  }

  async deletefile(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    console.log('ATTACH : ', attachment);
    if (!attachment) throw new NotFoundException();
    console.log('SSSSSSS : ', attachment);

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('ARVAN_S3_BUCKET'),
        Key: attachment.key,
      }),
    );

    await this.prisma.attachment.delete({
      where: { id },
    });

    return {
      message: 'Delete File Was Successfull',
    };
  }
}
