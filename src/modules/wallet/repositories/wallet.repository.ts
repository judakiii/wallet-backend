// src/modules/user/repositories/user.repository.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories';
import { PrismaService } from '../../../prisma';
import { Wallet } from 'src/schema';
import { UserRepository } from 'src/modules/user/repositories';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletRepository {
  protected readonly logger: Logger;
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
  ) {
    this.logger = new Logger(`Wallet Repository`);
  }

  /**
   * Create new entity
   */
  async create(data: any): Promise<Wallet> {
    this.logger.debug(`Creating wallet:`, data);

    const entity = await this.prisma.wallet.create({
      data,
    });

    this.logger.log(`wallet created with id: ${entity.id}`);
    return entity as Wallet;
  }

  /**
   * Find entity by Phone
   */
  async findByPhone(phone: string): Promise<Wallet | null> {
    this.logger.debug(`Finding wallet by phone: ${phone}`);

    const user = await this.userRepository.findByPhone({ phone });

    const entity = await this.prisma.wallet.findUnique({
      where: { id: user?.id ?? '' },
    });

    return entity as Wallet | null;
  }

  /**
   * Update entity
   */
  async update(userId: string, data: any): Promise<Wallet | null> {
    this.logger.debug(`Update wallet by userId: ${userId}`);

    const entity = await this.prisma.wallet.update({
      where: { userId },
      data,
    });

    return entity as Wallet | null;
  }

  async findById(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const entity = await client.wallet.findUnique({ where: { userId } });
    return entity as Wallet | null;
  }

  async updateBalance(
    id: string,
    balance: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const entity = await client.wallet.update({
      where: { id },
      data: { balance },
    });
    return entity as Wallet | null;
  }

  async lockWallet(id: string, tx: Prisma.TransactionClient) {
    const entity = await tx.$queryRaw`
      SELECT * FROM "wallets"
      WHERE id = ${id}
      FOR UPDATE
    `;
    return entity as Wallet | null;
  }
}
