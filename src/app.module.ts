import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { UnitOfWorkModule } from './common/unit-of-work';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RedisModule } from './redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guard';
import { WalletModule } from './modules/wallet/wallet.module';
import { UserModule } from './modules/user/user.module';
import { DashboardGateway } from './socket/dashboard.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AttachmentsModuleV1 } from './modules/attachments/v1/attachments.v1.module';
import { AttachmentsModuleV2 } from './modules/attachments/v2/attachments.v2.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    PrismaModule,
    UnitOfWorkModule,
    AuthModule,
    NotificationModule,
    WalletModule,
    UserModule,
    TransactionModule,
    ConversationModule,
    AttachmentsModuleV1,
    AttachmentsModuleV2,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    DashboardGateway,
  ],
})
export class AppModule {}
