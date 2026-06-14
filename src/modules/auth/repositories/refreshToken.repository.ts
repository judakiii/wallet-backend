import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { RefreshToken } from 'src/schema';

@Injectable()
export class RefreshTokenRepositories {
  protected readonly logger: Logger;
  constructor(private prisma: PrismaService) {
    this.logger = new Logger(`Refresh Tokens Repository`);
  }

  async findOne(args: any): Promise<RefreshToken | null> {
    this.logger.debug(`Finding one RefreshToken with where:`, args.where);

    const entity = await this.prisma.refreshToken.findFirst({
      where: args.where,
      include: args.include,
    });

    return entity as RefreshToken | null;
  }

  async create(data: any): Promise<RefreshToken> {
    this.logger.debug(`Creating Refresh Token:`, data);

    const entity = await this.prisma.refreshToken.create({
      data: {
        ...data,
      },
    });

    this.logger.log(`Refresh Token created with id: ${entity.id}`);
    return entity as RefreshToken;
  }

  async updateMany(args: any): Promise<any> {
    this.logger.debug(`Update many s`, args.where);

    const result = await this.prisma.refreshToken.updateMany({
      where: args.where,
      data: args.data,
    });

    this.logger.log(`${result.count} refreshTokens updated`);
    return result;
  }

  async deleteMany(args: any): Promise<{ count: number }> {
    this.logger.debug(`Deleting many s`, args.where);

    const result = await this.prisma.refreshToken.deleteMany({
      where: args.where,
    });

    this.logger.log(`${result.count} refreshTokens deleted`);
    return result;
  }

  async softDeleteRefreshToken(args: any) {
    this.logger.debug(`Soft Delete Of RefreshToken (revoked):`, args.where.id);
    const result = await this.prisma.refreshToken.updateMany({
      where: args.where,
      data: { revoked: true },
    });

    this.logger.log(`${result} refreshTokens soft deleted`);
    return result;
  }
}
