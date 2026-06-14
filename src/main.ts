import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { TransformInterceptor } from './common/interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const i18n = app.get<I18nService<Record<string, unknown>>>(I18nService);
  const config = new ConfigService();
  const allowedOrigins =
    config.get<string>('NODE_ENV') === 'production'
      ? ['https://myapp.com']
      : ['http://localhost:3000', 'http://localhost:4000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 3600,
  });

  app.use(cookieParser());
  app.useGlobalInterceptors(new TransformInterceptor(i18n));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
