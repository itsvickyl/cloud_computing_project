import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): Request {
    const request: Request = context.switchToHttp().getRequest();

    const token =
      request.cookies[process.env.COOKIE_NAME || 'talentscope-auth-token'];

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }
    return request;
  }
}
