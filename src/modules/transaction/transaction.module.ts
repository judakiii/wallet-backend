import { Module } from '@nestjs/common';
import { TransactionRepository } from './repositories';
import { TransactionController } from './transaction.contoller';
import { TransactionService } from './transaction.service';
import { UserRepository } from '../user/repositories';
import { WalletRepository } from '../wallet/repositories';
import { UnitOfWorkFactory } from 'src/common';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    UserRepository,
    WalletRepository,
    UnitOfWorkFactory,
  ],
})
export class TransactionModule {}
