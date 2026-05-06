import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WalletService } from './wallet.service';
import { CurrentUser, type CurrentUserDto } from 'src/common';
import { type UpdateWalletDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // see data of your wallet
  @Get('')
  account(@CurrentUser() user: CurrentUserDto) {
    return this.walletService.getWallet(user.id);
  }

  // see data of your wallet
  @Get('amount')
  amount(@CurrentUser() user: CurrentUserDto) {
    return this.walletService.getAmount(user.id);
  }

  // update wallet
  @Patch('')
  charge(@Body() body: UpdateWalletDto) {
    return this.walletService.update(body);
  }
}
