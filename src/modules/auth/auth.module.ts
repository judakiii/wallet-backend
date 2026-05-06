import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.contoller';
import { UserRepository } from '../user/repositories';
import { WalletRepository } from '../wallet/repositories';
import { RefreshTokenRepositories } from './repositories';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from 'src/prisma';
import { RedisService } from 'src/redis';
import { NotificationService } from '../notification/notification.service';

const configService = new ConfigService();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get<string>('JWT_EXPIRES_IN', '5m') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    RedisService,
    UserRepository,
    WalletRepository,
    RefreshTokenRepositories,
    NotificationService,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
