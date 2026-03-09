import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserType } from 'src/users/entities/user.enum';
import { Request } from 'express';

@Injectable()
export class GoogleOAuth2Strategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.googleId') || '',
      clientSecret: configService.get<string>('oauth.googleSecret') || '',
      scope: ['email', 'profile'],
      callbackURL: configService.get<string>('oauth.callbackUrl'),
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, photos, emails } = profile;

    if (!emails) {
      done(
        {
          message: 'Email not found',
        },
        undefined,
      );
      return;
    }

    let state: { type?: UserType; redirectTo?: string } = {};
    try {
      if (req.query.state) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        state = JSON.parse(req.query.state as string);
      }
    } catch (error) {
      console.error('Failed to parse state', error);
    }

    const validatedUser = {
      email: emails[0].value,
      username: `${name?.givenName} ${name?.familyName}`,
      profilePic: photos?.[0].value,
      redirectTo: state.redirectTo || '/',
      type: state.type || UserType.USER,
    };
    done(null, validatedUser);
  }
}
