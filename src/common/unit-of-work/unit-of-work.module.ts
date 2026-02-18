import { Global, Module } from '@nestjs/common';
import { UnitOfWork } from './unit-of-work';
import { UnitOfWorkFactory } from './unit-of-work.factory';

/**
 * Unit of Work Module
 * Global module that provides UoW and UoW Factory
 */
@Global()
@Module({
  providers: [UnitOfWork, UnitOfWorkFactory],
  exports: [UnitOfWork, UnitOfWorkFactory],
})
export class UnitOfWorkModule {}