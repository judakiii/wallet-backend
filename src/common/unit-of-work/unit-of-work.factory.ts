import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { UnitOfWork } from './unit-of-work';

/**
 * Unit of Work Factory
 * Creates new UnitOfWork instances
 * Use this in services to get a fresh UoW for each transaction
 */
@Injectable()
export class UnitOfWorkFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new Unit of Work instance
   */
  create(): UnitOfWork {
    return new UnitOfWork(this.prisma);
  }
}