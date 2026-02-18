// src/modules/user/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from "../../../common/repositories"
import { PrismaService } from '../../../prisma';
import { User } from 'src/schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  // Custom method: Find by email
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  // Custom method: Find active users
  async findActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}