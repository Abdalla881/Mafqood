import { Controller, Post, Body, Put } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignUpUserDto } from '../dtos/signUp-user.dto';
import { LogInDto } from '../dtos/logIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  //desc reset password
  // @route Put /api/v1/auth/reset-password
  // @access public
  @Put('reset-password')
  resetPassword(@Body() body: { email: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }
}
