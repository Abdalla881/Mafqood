import {
  Controller,
  Post,
  Body,
  Put,
  Req,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { SignUpUserDto } from '../dtos/signUp-user.dto';
import { LogInDto } from '../dtos/logIn.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  //@desc sign up a new user
  // @route POST /api/v1/auth/signup
  // @access public
  @Post('signup')
  signIn(@Body() userData: SignUpUserDto) {
    return this.authService.signup(userData);
  }

  //@desc log in a user
  // @route POST /api/v1/auth/login
  // @access public
  @Post('login')
  logIn(@Body() logInData: LogInDto) {
    return this.authService.login(logInData);
  }

  //desc forget password
  // @route POST /api/v1/auth/forget-password
  // @access public
  @Post('forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.authService.forgetPassword(email);
  }

  //desc verify reset code
  // @route POST /api/v1/auth/verify-reset-code
  // @access public
  @Post('verify-reset-code')
  verifyResetCode(@Body() body: { email: string; resetCode: string }) {
    console.log(body);

    return this.authService.verifyResetCode(body.email, body.resetCode);
  }

  // @desc google login
  // @route POST /api/v1/auth/google
  // @access public
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res: any) {
    try {
      const result = await this.authService.googleLogin(req.user);

      // Store token in a cookie for backend use
      const isProd =
        this.configService.get<string>('NODE_ENV') === 'production';

      res.cookie('auth_token', result.token, {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      const frontendOrigin =
        this.configService.get<string>('FRONTEND_ORIGIN') ||
        'http://localhost:8080';

      // This is necessary because Vercel subdomains can't share cookies
      const redirectUrl = `${frontendOrigin}/auth/google/callback?token=${result.token}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendOrigin =
        this.configService.get<string>('FRONTEND_ORIGIN') ||
        'http://localhost:8080';

      const message =
        (error as Error)?.message || 'Authentication failed. Please try again.';

      const redirectUrl = `${frontendOrigin}/auth/google/callback?error=${encodeURIComponent(
        message,
      )}`;

      return res.redirect(redirectUrl);
    }
  }

  //desc reset password
  // @route Put /api/v1/auth/reset-password
  // @access public
  @Put('reset-password')
  resetPassword(@Body() body: { email: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }
}
