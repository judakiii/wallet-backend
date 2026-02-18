import { IRepository, IPaginationResult, IPaginationParams } from '../interfaces/repository.interface';
import { PrismaService } from '../../prisma';
import { Logger, NotFoundException } from '@nestjs/common';

/**
 * Base Repository
 * Generic implementation of common CRUD operations using Prisma
 * All specific repositories should extend this class
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected readonly logger: Logger;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {
    this.logger = new Logger(`${modelName}Repository`);
  }

  /**
   * Get Prisma model delegate
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    this.logger.debug(`Finding ${this.modelName} by id: ${id}`);
    
    const entity = await this.model.findUnique({
      where: { id },
    });

    return entity as T | null;
  }

  /**
   * Find entity by ID or throw error
   */
  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.findById(id);
    
    if (!entity) {
      throw new NotFoundException(`${this.modelName} with id ${id} not found`);
    }

    return entity;
  }

  /**
   * Find all entities with optional filtering
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<T[]> {
    this.logger.debug(`Finding all ${this.modelName}s with params:`, params);

    const entities = await this.model.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.where,
      orderBy: params?.orderBy,
      include: params?.include,
      select: params?.select,
    });

    return entities as T[];
  }

  /**
   * Find one entity by criteria
   */
  async findOne(where: any, include?: any): Promise<T | null> {
    this.logger.debug(`Finding one ${this.modelName} with where:`, where);

    const entity = await this.model.findFirst({
      where,
      include,
    });

    return entity as T | null;
  }

  /**
   * Find one or fail
   */
  async findOneOrFail(where: any, include?: any): Promise<T> {
    const entity = await this.findOne(where, include);
    
    if (!entity) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return entity;
  }

  /**
   * Create new entity
   */
  async create(data: any): Promise<T> {
    this.logger.debug(`Creating ${this.modelName}:`, data);

    const entity = await this.model.create({
      data,
    });

    this.logger.log(`${this.modelName} created with id: ${entity.id}`);
    return entity as T;
  }

  /**
   * Create many entities
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    this.logger.debug(`Creating ${data.length} ${this.modelName}s`);

    const result = await this.model.createMany({
      data,
      skipDuplicates: true,
    });

    this.logger.log(`${result.count} ${this.modelName}s created`);
    return result;
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: any): Promise<T> {
    this.logger.debug(`Updating ${this.modelName} with id: ${id}`, data);

    const entity = await this.model.update({
      where: { id },
      data,
    });

    this.logger.log(`${this.modelName} updated with id: ${id}`);
    return entity as T;
  }

  /**
   * Update many entities
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    this.logger.debug(`Updating many ${this.modelName}s`, { where, data });

    const result = await this.model.updateMany({
      where,
      data,
    });

    this.logger.log(`${result.count} ${this.modelName}s updated`);
    return result;
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<T> {
    this.logger.debug(`Deleting ${this.modelName} with id: ${id}`);

    const entity = await this.model.delete({
      where: { id },
    });

    this.logger.log(`${this.modelName} deleted with id: ${id}`);
    return entity as T;
  }

  /**
   * Soft delete (if model has isActive field)
   */
  async softDelete(id: string): Promise<T> {
    this.logger.debug(`Soft deleting ${this.modelName} with id: ${id}`);

    const entity = await this.model.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`${this.modelName} soft deleted with id: ${id}`);
    return entity as T;
  }

  /**
   * Delete many entities
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    this.logger.debug(`Deleting many ${this.modelName}s`, where);

    const result = await this.model.deleteMany({
      where,
    });

    this.logger.log(`${result.count} ${this.modelName}s deleted`);
    return result;
  }

  /**
   * Count entities
   */
  async count(where?: any): Promise<number> {
    const count = await this.model.count({
      where,
    });

    return count;
  }

  /**
   * Check if entity exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({
      where,
      take: 1,
    });

    return count > 0;
  }

  /**
   * Paginate results
   */
  async paginate(
    params: IPaginationParams & {
      where?: any;
      include?: any;
      select?: any;
    },
  ): Promise<IPaginationResult<T>> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.findAll({
        skip,
        take: pageSize,
        where: params.where,
        orderBy: params.sortBy
          ? { [params.sortBy]: params.sortOrder || 'asc' }
          : undefined,
        include: params.include,
        select: params.select,
      }),
      this.count(params.where),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Execute raw query
   */
  async executeRaw(query: string, params?: any[]): Promise<any> {
    this.logger.debug(`Executing raw query: ${query}`, params);
    return await this.prisma.$queryRawUnsafe(query, ...(params || []));
  }
}