import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionRepository } from './repositories';
import { UserRepository } from '../user/repositories';
import { WalletRepository } from '../wallet/repositories';
import { UnitOfWorkFactory } from 'src/common';
import { TransferDto } from './dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly uowFactory: UnitOfWorkFactory,
  ) {}

  async transfer(userId: string, body: TransferDto) {
    const destinationUser = await this.userRepository.findByIdentifier({
      identifier: body.identifier,
    });

    if (!destinationUser?.isActive)
      throw new NotAcceptableException('destinationUser Is Not Active !');

    const originWallet = await this.walletRepository.findById(userId);
    if (!originWallet?.isActive)
      throw new NotAcceptableException('User Wallet Is Not Active !');

    if (originWallet.balance < body.amount)
      throw new NotAcceptableException('Insufficient balance');

    const destinationWallet = await this.walletRepository.findById(
      destinationUser.id,
    );

    if (originWallet.currency !== destinationWallet?.currency)
      throw new NotAcceptableException('Currencies mismatch');

    const uow = this.uowFactory.create();

    const result = await uow.execute(async (tx) => {
      // فقط همین transaction استفاده می‌شود
      const originRows = await this.walletRepository.lockWallet(
        originWallet.id,
        tx.getTransactionClient(),
      );

      const destinationRows = await this.walletRepository.lockWallet(
        destinationWallet.id,
        tx.getTransactionClient(),
      );

      const lockedOrigin = originRows?.[0];
      const lockedDestination = destinationRows?.[0];

      console.log('FFFFFFF : ', lockedOrigin);
      console.log('XXXXXXX : ', lockedDestination);

      if (!lockedOrigin)
        throw new NotAcceptableException('Origin wallet not found');

      if (!lockedDestination)
        throw new NotAcceptableException('Destination wallet not found');

      const fee = 0.02 * body.amount;

      const originBalance = Number(lockedOrigin.balance) - body.amount - fee;
      const destinationBalance =
        Number(lockedDestination.balance) + body.amount;

      if (originBalance < 0)
        throw new NotAcceptableException('Insufficient balance');

      await this.walletRepository.updateBalance(
        lockedOrigin.id,
        originBalance,
        tx.getTransactionClient(),
      );

      await this.walletRepository.updateBalance(
        lockedDestination.id,
        destinationBalance,
        tx.getTransactionClient(),
      );

      // ساخت تراکنش صحیح
      await this.transactionRepository.create(
        {
          data: {
            toWallet: { connect: { id: lockedOrigin.id } },
            fromWallet: { connect: { id: lockedDestination.id } },
            amount: body.amount,
            fee,
            type: 'TRANSFER',
            description: body.description ?? '',
          },
        },
        tx.getTransactionClient(),
      );

      return { fee };
    });

    return {
      data: { transactionFee: result.fee },
      message: 'Transaction was Successfully',
    };
  }

  async transactionsList() {
    const transactionLst = await this.transactionRepository.findAll();
    if (!transactionLst) throw new NotFoundException('No Records Find !');
    return {
      data: {
        data: transactionLst,
      },
      message: 'Get Transactions List',
    };
  }
}
