// src/modules/user/repositories/user.repository.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { Wallet } from 'src/schema';
import { Prisma, Transaction, User } from '@prisma/client';

@Injectable()
export class TransactionRepository {
  protected readonly logger: Logger;
  constructor(private prisma: PrismaService) {
    this.logger = new Logger(`Transaction Repository`);
  }

  async create(
    args: { data: Prisma.TransactionCreateInput },
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction | null> {
    this.logger.debug(`Create Transaction`);

    const client = tx ?? this.prisma;

    const entity = await client.transaction.create({
      data: args.data,
    });

    return entity as Transaction | null;
  }

  async findAll(): Promise<any | null> {
    this.logger.debug(`Get All Transactions`);

    const entity = await this.prisma.transaction.findMany();

    return entity as any | null;
  }
}
