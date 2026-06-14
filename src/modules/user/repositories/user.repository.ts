// src/modules/user/repositories/user.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { User } from 'src/schema';

@Injectable()
export class UserRepository {
  protected readonly logger: Logger;
  constructor(private prisma: PrismaService) {
    this.logger = new Logger(`User Repository`);
  }

  async findByEmail(args: any): Promise<User | null> {
    this.logger.debug(`Finding one User with where:`);

    const entity = await this.prisma.user.findFirst({
      where: { email: args.email },
      include: args.include,
    });

    return entity as User | null;
  }

  async findByPhone(args: any): Promise<User | null> {
    this.logger.debug(`Finding one User with where:`);

    const entity = await this.prisma.user.findFirst({
      where: { phone: args.phone },
      include: args.include,
    });

    return entity as User | null;
  }

  async findByIdentifier(args: any): Promise<User | null> {
    this.logger.debug(`Finding one User with where :`);

    const entity = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: args.identifier }, { email: args.identifier }],
      },
      include: args.include,
    });

    return entity as User | null;
  }

  async findById(id: string): Promise<User | null> {
    this.logger.debug(`Finding User by id: ${id}`);

    const entity = await this.prisma.user.findUnique({
      where: { id },
    });

    return entity as User | null;
  }

  async findActiveUsers(): Promise<User[]> {
    this.logger.debug(`Finding all Users with params:`);

    const entities = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return entities as User[];
  }

  async exists(args: any): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: args.where,
      take: 1,
    });

    return count > 0;
  }

  async create(data: any): Promise<User> {
    this.logger.debug(`Creating User:`, data);

    const entity = await this.prisma.user.create({
      data,
    });

    this.logger.log(`User created with id: ${entity.id}`);
    return entity as User;
  }

  async update(args: any): Promise<User> {
    this.logger.debug(`Update User:`, args.data);

    const entity = await this.prisma.user.update({
      where: args.where,
      data: args.data,
    });

    this.logger.log(`User updated with id: ${entity.id}`);
    return entity as User;
  }

  async upsert(args: {
    where: any;
    create: any;
    update: any;
  }): Promise<{ user: User; isNew: boolean }> {
    this.logger.debug(`Upserting User`);

    const existing = await this.prisma.user.findFirst({
      where: args.where,
    });

    let entity;
    let isNew = false;

    if (existing) {
      entity = await this.prisma.user.update({
        where: { id: existing.id },
        data: args.update,
      });
      this.logger.log(`User updated with id: ${entity.id}`);
    } else {
      entity = await this.prisma.user.create({
        data: args.create,
      });
      isNew = true;
      this.logger.log(`User created with id: ${entity.id}`);
    }

    return { user: entity as User, isNew };
  }
}
