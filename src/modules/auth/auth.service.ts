import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../user/repositories';
import { WalletRepository } from '../wallet/repositories';
import { UnitOfWorkFactory } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto, LoginDto, RegisterDto, VerifyOtpDto } from './dto';
import { RefreshTokenRepositories } from './repositories';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { RedisService } from 'src/redis';
import { NotificationService } from '../notification/notification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly refreshTokenRepository: RefreshTokenRepositories,
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async register(body: RegisterDto, res: Response): Promise<AuthResponseDto> {
    this.logger.log(`Registering new user: ${body.identifier}`);

    const isRegisterByEmail = body.identifier.includes('@');
    let newUserSchema = {};

    const uow = this.uowFactory.create();

    const result = await uow.execute(async () => {
      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);
      if (isRegisterByEmail) {
        // Check if email already exists
        const emailExists = await this.userRepository.exists({
          where: {
            email: body.identifier,
          },
        });

        if (emailExists) {
          throw new ConflictException('Email already exists');
        }
        newUserSchema = {
          email: body.identifier,
          password: hashedPassword,
        };
      } else {
        // Check if phone already exists
        const phoneExists = await this.userRepository.exists({
          phone: body.identifier,
        });
        if (phoneExists) {
          throw new ConflictException('Phone already exists');
        }
        newUserSchema = {
          phone: body.identifier,
          password: hashedPassword,
        };
      }

      // Create user
      const user = await this.userRepository.create(newUserSchema);
      this.logger.log(`User created: ${user.id}`);

      // Create wallet for user
      const wallet = await this.walletRepository.create({
        userId: user.id,
        balance: 0,
        currency: 'USD',
      });

      this.logger.log(`Wallet created for user: ${wallet.id}`);

      return { user, wallet };
    });

    const tokens = await this.generateTokens(result.user.id);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { accessToken: tokens.accessToken, expiresIn: 5 * 60 * 1000 },
      message: 'common.signUpSuccessfully',
    };
  }

  async login(body: LoginDto, res: Response): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt for: ${body.identifier}`);

    // Find user by identifier
    const user = await this.userRepository.findByIdentifier({
      identifier: body.identifier,
    });
    if (!user) {
      throw new UnauthorizedException('User Not Found!');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    this.logger.log(`User logged in: ${user.id}`);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { accessToken: tokens.accessToken, expiresIn: 5 * 60 * 1000 },
      message: 'common.loginSuccessfully',
    };
  }

  async logout(req: Request, res: Response, userId: string) {
    // 1. Read refresh token from cookie
    const refreshToken = req.cookies['refresh_token'];

    if (refreshToken) {
      await this.refreshTokenRepository.softDeleteRefreshToken({
        where: {
          userId,
        },
      });
    }

    // // 2. Read access token from Authorization header
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1];

    if (accessToken) {
      const decoded: any = this.jwtService.decode(accessToken);

      if (decoded?.jti) {
        // 3. Blacklist access token via Redis
        await this.redis.setCacheTtl(
          `blackList:${decoded.jti}`,
          'revoked',
          60 * 1,
        );
      }
    }

    // 4. Clear Refresh Token Cookie
    res.clearCookie('refresh_token', {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { message: 'common.logoutSuccessfully' };
  }

  async sendOtp(phone: string, res: Response) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtpCode = await bcrypt.hash(otpCode, 5);
    this.redis.setCacheTtl(`phone:${phone}`, hashedOtpCode, 2 * 60);
    await this.notificationService.sendSms(phone, otpCode);

    return { message: 'common.otpSent' };
  }

  async verifyByOtp(body: VerifyOtpDto, res: Response) {
    const isRegisterByEmail = body.identifier.includes('@');
    const otpCode = await this.redis.getCache(
      isRegisterByEmail
        ? `email:${body.identifier}`
        : `phone:${body.identifier}`,
    );

    if (!otpCode) throw new BadRequestException('OTP Code is Was Expired');

    const isValidOtpCode = await bcrypt.compare(body.code, otpCode);
    if (!isValidOtpCode) throw new BadRequestException('OTP Code is Wrong');

    const uow = this.uowFactory.create();
    const result = await uow.execute(async () => {
      const res = await this.userRepository.upsert({
        where: {
          OR: [{ phone: body.identifier }, { email: body.identifier }],
        },
        create: {
          ...(isRegisterByEmail
            ? { email: body.identifier }
            : { phone: body.identifier }),
        },
        update: {
          ...(isRegisterByEmail
            ? { email: body.identifier }
            : { phone: body.identifier }),
        },
      });

      if (res.isNew) {
        // Create wallet for user
        const wallet = await this.walletRepository.create({
          userId: res.user.id,
          balance: 0,
          currency: 'USD',
        });

        this.logger.log(`Wallet created for user: ${wallet.id}`);
      }

      return res;
    });

    const tokens = await this.generateTokens(result.user.id);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
      message: `common.${result.isNew ? 'signUp' : 'login'}Successfully`,
    };
  }

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, jti: randomUUID() },
      {
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        secret: this.configService.get('JWT_SECRET'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.refreshTokenRepository.create({
      userId,
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(
    req: Request,
    res: Response,
  ): Promise<{
    data: { accessToken: string; expiresIn: number };
    message: string;
  }> {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) throw new UnauthorizedException();

    // Verify refresh token
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: {
        userId: payload.sub,
        revoked: false,
      },
    });

    if (!refreshTokenRecord)
      throw new UnauthorizedException('Refresh Token Is not Active');

    const compareTokens = await bcrypt.compare(
      refreshToken,
      refreshTokenRecord.tokenHash,
    );

    if (!compareTokens) {
      throw new UnauthorizedException('Refresh Token does not match');
    }

    await this.refreshTokenRepository.updateMany({
      where: {
        userId: payload.sub,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    const tokens = await this.generateTokens(payload.sub);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { accessToken: tokens.accessToken, expiresIn: 5 * 60 * 1000 },
      message: 'common.loginSuccessfully',
    };
  }

  async validateUser(payload: any) {
    const user = await this.userRepository.findById(payload.sub);
    const checkBlackList = await this.redis.getCache(
      `blackList:${payload.jti}`,
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (payload.jti && checkBlackList) {
      throw new UnauthorizedException('Please Login Again');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
    };
  }
}
