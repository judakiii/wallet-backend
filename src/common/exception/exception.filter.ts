import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
@Injectable()
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: any, host: ArgumentsHost) {
    console.log('catch : ', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang =
      request.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';

    let status = 500;
    let messageKey = 'error.internalServerError';
    let errorDetails: string | object | null = null;

    // Handle Prisma known errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = 400;
      if (exception.code === 'P2002') {
        // Duplicate key (Unique constraint failed)
        const field = exception.meta?.target?.[0] || 'field';
        messageKey = `error.duplicate`;
        errorDetails = `${field} already exists`;
      } else if (exception.code === 'P2025') {
        messageKey = `error.recordNotFound`;
        errorDetails = `Record not found`;
        status = 404;
      } else {
        messageKey = `error.database`;
        errorDetails = exception.message;
      }
    }

    // Handle HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (typeof exceptionResponse === 'object') {
        messageKey = exceptionResponse.message || messageKey;
        errorDetails = exceptionResponse.error || null;
      } else if (typeof exceptionResponse === 'string') {
        messageKey = exceptionResponse;
      }
    }

    // ✅ Translate message
    const translatedMessage = await this.i18n.translate(messageKey, { lang });

    response.status(status).json({
      success: false,
      data: null,
      message: translatedMessage,
      error: errorDetails,
    });
  }
}
