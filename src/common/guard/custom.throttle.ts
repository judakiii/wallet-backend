import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): any {
    throw new BadRequestException('Too many requests. Please try again later.');
  }
}
