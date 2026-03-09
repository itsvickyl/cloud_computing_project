import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleOAuthGuard } from './guards/google.guard';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { Request, Response } from 'express';
import { isPasswordStrong } from './utils/pass.util';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  async signIn(
    @Res() res: Response,
    @Body() signInDto: Record<string, string>,
  ) {
    const u = await this.authService.signIn(signInDto.email, signInDto.pass);
    const token = await this.authService.generateToken(u);

    return res.json({
      message: 'Login successful',
      token,
    });
  }

  @Post('register')
  async signUp(
    @Res() res: Response,
    @Body() registerDto: Record<string, string>,
  ) {
    try {
      if (!isPasswordStrong(registerDto.password)) {
        return res.json({
          message: 'Password weak',
          status: 400,
        });
      }
      const u = await this.authService.signUp(registerDto);
      const token = await this.authService.generateToken(u);

      return res.json({
        message: 'Registered successfully',
        token,
      });
    } catch (error) {
      return res.json(error.response);
    }
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User & { redirectTo: string };
    const u = await this.authService.validateUser({
      email: user.email,
      username: user.username,
      type: user.type,
      profilePic: user.profilePic,
    });

    const token = await this.authService.generateToken(u.user as User);

    if (token) {
      let redirectTo = user.redirectTo || '/';
      if (u.isNew) {
        redirectTo = '/onboarding';
      }
      res.redirect(
        `${this.configService.get<string>('client.url')}/auth/callback?token=${token}&redirectTo=${redirectTo}`,
      );
    } else {
      res.redirect(
        `${this.configService.get<string>('client.url')}/auth/error`,
      );
    }
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.redirect(
      this.configService.get<string>('client.url') + '/auth/logout-callback',
    );
  }
}
