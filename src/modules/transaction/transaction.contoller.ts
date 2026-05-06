import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, type CurrentUserDto } from 'src/common';
import { TransactionRepository } from './repositories';
import { TransactionService } from './transaction.service';
import { type TransferDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // Transfer money from wallet
  @Patch('transfer')
  transfer(@CurrentUser() user: CurrentUserDto, @Body() body: TransferDto) {
    return this.transactionService.transfer(user.id, body);
  }

  // See Transation Lists
  @Get('')
  transactionList() {
    return this.transactionService.transactionsList();
  }
}
