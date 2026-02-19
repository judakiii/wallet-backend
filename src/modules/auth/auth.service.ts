import { ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../user/repositories";
import { WalletRepository } from "../wallet/repositories";
import { UnitOfWorkFactory } from "src/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt';
import { AuthResponseDto, LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    ) {}
    
/**
   * Register new user with automatic wallet creation
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Registering new user: ${registerDto.email}`);

    const uow = this.uowFactory.create();

    const result = await uow.execute(async () => {
      // Check if email already exists
      const emailExists = await this.userRepository.exists(registerDto.email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create user
      const user = await this.userRepository.create({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      });

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

    // Generate tokens
    const tokens = await this.generateTokens(result.user.id, result.user.email);

    return {
      ...tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    };
  }

   /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Login attempt for: ${loginDto.email}`);

    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    this.logger.log(`User logged in: ${user.id}`);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

    /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

   /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Generate new access token
      const accessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') as any,
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

   /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne(userId , {include : { wallet: true }});
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      // wallet: user.wallet
      //   ? {
      //       id: user.wallet.id,
      //       balance: Number(user.wallet.balance),
      //       currency: user.wallet.currency,
      //     }
      //   : null,
    };
  }

}