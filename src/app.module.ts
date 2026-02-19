import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { UnitOfWorkModule } from './common/unit-of-work';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UnitOfWorkModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}