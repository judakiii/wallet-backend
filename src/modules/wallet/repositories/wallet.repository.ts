// src/modules/user/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from "../../../common/repositories"
import { PrismaService } from '../../../prisma';
import { Wallet } from 'src/schema';

@Injectable()
export class WalletRepository extends BaseRepository<Wallet> {
  constructor(prisma: PrismaService) {
    super(prisma, 'wallet');
  }

  // Custom method: Find by email
  async findByIdWithWallet(userId: string): Promise<Wallet | null> {
    return this.findById(userId)
  }

  // Custom method: Find active users
  async findActiveUsers(): Promise<Wallet[]> {
    return this.findAll({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}