/**
 * Generic Repository Interface
 * Defines standard CRUD operations that all repositories must implement
 */
export interface IRepository<T> {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional filtering
   */
  findAll(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<T[]>;

  /**
   * Find one entity by criteria
   */
  findOne(where: any): Promise<T | null>;

  /**
   * Create new entity
   */
  create(data: any): Promise<T>;

  /**
   * Update entity by ID
   */
  update(id: string, data: any): Promise<T>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<T>;

  /**
   * Count entities
   */
  count(where?: any): Promise<number>;

  /**
   * Check if entity exists
   */
  exists(where: any): Promise<boolean>;
}

/**
 * Pagination result interface
 */
export interface IPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Pagination params interface
 */
export interface IPaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}