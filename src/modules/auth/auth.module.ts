import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.contoller';
import { UserRepository } from '../user/repositories';
import { WalletRepository } from '../wallet/repositories';
import { JwtStrategy } from './jwt.strategy';

const configService = new ConfigService();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m') as any,
        },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserRepository,
    WalletRepository,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}