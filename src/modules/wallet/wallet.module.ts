import { Module } from '@nestjs/common';
import { WalletController } from './wallet.contoller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './repositories';
import { UserRepository } from '../user/repositories';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletRepository, UserRepository],
  exports: [WalletService],
})
export class WalletModule {}
