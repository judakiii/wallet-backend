import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Query,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  type RegisterDto,
  type LoginDto,
  type SendOtpDto,
  type VerifyOtpDto,
  SendOtpSchema,
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from './dto';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser, type CurrentUserDto } from 'src/common';
import { type Request, type Response } from 'express';
import { ZodValidation } from 'src/common/pipes';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ZodValidation(RegisterSchema))
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidation(LoginSchema))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  /**
   * Send Code to user
   * POST /auth/send_otp
   */
  @Post('send_otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidation(SendOtpSchema))
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  async sendOtp(
    @Body() body: SendOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.sendOtp(body.identifier, res);
  }

  /**
   * Verify Code of user
   * POST /auth/verify_otp
   */
  @Post('verify_otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verfyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyByOtp(verfyOtpDto, res);
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidation(RefreshTokenSchema))
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }

  /**
   * Logout and Revoked Tokens
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.authService.logout(req, res, user.id);
  }
}
