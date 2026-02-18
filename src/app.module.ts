import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { UnitOfWorkModule } from './common/unit-of-work';
@Module({
  imports: [
    PrismaModule,
    UnitOfWorkModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}