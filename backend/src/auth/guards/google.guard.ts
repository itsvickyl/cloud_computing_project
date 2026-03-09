/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const userType = request.query.userType as string;
    const redirectTo = request.query.redirectTo as string;

    return {
      state: JSON.stringify({
        type: userType,
        redirectTo: redirectTo || '/',
      }),
    };
  }
}
