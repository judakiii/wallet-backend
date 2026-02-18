/**
 * Unit of Work Interface
 * Manages transactions across multiple repositories
 * Ensures all operations succeed or fail together (ACID)
 */
export interface IUnitOfWork {
  /**
   * Start a new transaction
   */
  startTransaction(): Promise<void>;

  /**
   * Commit the transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<void>;

  /**
   * Check if transaction is active
   */
  isTransactionActive(): boolean;

  /**
   * Execute work within a transaction
   * Automatically commits on success, rolls back on error
   */
  execute<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}

/**
 * Transaction Context
 * Holds the current Prisma transaction client
 */
export interface ITransactionContext {
  prismaTransaction: any;
}