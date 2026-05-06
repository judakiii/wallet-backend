import { Injectable, NotFoundException } from '@nestjs/common';
import { WalletRepository } from './repositories';
import { UserRepository } from '../user/repositories';
import { UpdateWalletDto } from './dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async getWallet(id: string) {
    const result = await this.walletRepository.findById(id);
    return {
      message: 'Get Data Was Successfully',
      data: result,
    };
  }

  async getAmount(id: string) {
    const result = await this.walletRepository.findById(id);
    return {
      message: 'Get Data Was Successfully',
      data: {
        amount: result?.balance ?? 0,
        currency: result?.currency ?? 'USD',
      },
    };
  }

  async update(data: UpdateWalletDto) {
    const user = await this.userRepository.findByIdentifier({
      identifier: data.identifier,
    });
    if (!user) throw new NotFoundException('Not Found User !');
    const body = {
      balance: data.balance,
      currency: data.currency,
      isActive: data.isActive,
    };
    const result = await this.walletRepository.update(user.id, body);
    return {
      message: 'Update Was Successfully',
      data: result,
    };
  }
}
