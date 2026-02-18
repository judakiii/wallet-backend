import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { IUnitOfWork } from '../interfaces/unit-of-work.interface';

/**
 * Unit of Work Implementation
 * Manages database transactions using Prisma's interactive transactions
 */
@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private readonly logger = new Logger(UnitOfWork.name);
  private transactionClient: any = null;
  private isActive = false;
  private repositories: Map<string, any> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the current transaction client (for repositories to use)
   */
  getTransactionClient(): any {
    return this.transactionClient || this.prisma;
  }

  /**
   * Start a new transaction
   * Note: With Prisma, we don't actually start the transaction here
   * We prepare the context and actual transaction starts when we use it
   */
  async startTransaction(): Promise<void> {
    if (this.isActive) {
      throw new Error('Transaction is already active');
    }

    this.logger.debug('Transaction context prepared');
    this.isActive = true;
  }

  /**
   * Commit the transaction
   * With Prisma interactive transactions, commit happens automatically
   * when the callback completes successfully
   */
  async commit(): Promise<void> {
    if (!this.isActive) {
      throw new Error('No active transaction to commit');
    }

    this.logger.debug('Transaction committed');
    this.cleanup();
  }

  /**
   * Rollback the transaction
   * With Prisma interactive transactions, rollback happens automatically
   * when an error is thrown
   */
  async rollback(): Promise<void> {
    if (!this.isActive) {
      throw new Error('No active transaction to rollback');
    }

    this.logger.warn('Transaction rolled back');
    this.cleanup();
  }

  /**
   * Check if transaction is active
   */
  isTransactionActive(): boolean {
    return this.isActive;
  }

  /**
   * Execute work within a transaction
   * This is the recommended way to use UoW with Prisma
   */
  async execute<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    this.logger.debug('Starting transaction execution');

    try {
      const result = await this.prisma.$transaction(async (prismaTransaction) => {
        // Set the transaction client
        this.transactionClient = prismaTransaction;
        this.isActive = true;

        // Execute the work
        const workResult = await work(this);

        // If work completes successfully, Prisma will auto-commit
        return workResult;
      });

      this.logger.log('Transaction completed successfully');
      this.cleanup();
      return result;
    } catch (error) {
      this.logger.error('Transaction failed, rolling back', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Execute work with custom transaction options
   */
  async executeWithOptions<T>(
    work: (uow: UnitOfWork) => Promise<T>,
    options?: {
      maxWait?: number; // Maximum time to wait for a transaction (ms)
      timeout?: number; // Maximum transaction duration (ms)
      isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
    },
  ): Promise<T> {
    this.logger.debug('Starting transaction with options:', options);

    try {
      const result = await this.prisma.$transaction(
        async (prismaTransaction) => {
          this.transactionClient = prismaTransaction;
          this.isActive = true;
          return await work(this);
        },
        options,
      );

      this.logger.log('Transaction with options completed successfully');
      this.cleanup();
      return result;
    } catch (error) {
      this.logger.error('Transaction with options failed', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Register a repository instance with this UoW
   * Useful for keeping track of which repositories are part of this transaction
   */
  registerRepository(name: string, repository: any): void {
    this.repositories.set(name, repository);
    this.logger.debug(`Repository registered: ${name}`);
  }

  /**
   * Get a registered repository
   */
  getRepository<T>(name: string): T {
    const repository = this.repositories.get(name);
    if (!repository) {
      throw new Error(`Repository ${name} not registered with this Unit of Work`);
    }
    return repository as T;
  }

  /**
   * Clean up transaction state
   */
  private cleanup(): void {
    this.transactionClient = null;
    this.isActive = false;
    this.repositories.clear();
  }
}