import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      console.log('HTTP : ', request.user);
      return request.user;
    }

    if (context.getType() === 'ws') {
      if (context.getType() === 'ws') {
        const client = context.switchToWs().getClient();
        console.log('WEB : ', client.handshake.user);
        return client.handshake.user;
      }
    }
  },
);
