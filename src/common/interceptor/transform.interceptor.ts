import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const acceptLanguage = request.headers['accept-language'] || 'en';
    const lang = acceptLanguage.split(',')[0].split('-')[0];

    return next.handle().pipe(
      tap((payload) => {
        console.log('Payload received:', payload);
      }),
      map((payload: any) => {
        const message = this.i18n.translate(payload.message, { lang });
        return {
          success: true,
          data: payload.data,
          message,
          error: null,
        };
      }),
    );
  }
}
