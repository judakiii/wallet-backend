import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient();

    const request = client.handshake;

    request.headers = {
      ...request.headers,
      authorization:
        client.handshake.headers?.authorization ||
        `Bearer ${client.handshake.auth?.token}`,
    };

    return request;
  }
}
