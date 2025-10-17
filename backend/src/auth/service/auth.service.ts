import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Model } from 'mongoose';
import { SignUpUserDto } from '../dtos/signUp-user.dto';
import { EmailService } from '../../email/email.service';
import { user } from '../../users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<user>,
    private jwtService: JwtService,
    private EmailService: EmailService,
  ) {}

  async signup(userData: SignUpUserDto) {
    const isexistingUser = await this.userModel.exists({
      email: userData.email,
    });
    if (isexistingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.userModel.create(userData);

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };
    return {
      message: 'User created successfully',
      user,
      token: await this.jwtService.signAsync(payload),
    };
  }
  async login(logInData: { email: string; password: string }) {
    const user = await this.userModel
      .findOne({ email: logInData.email })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      logInData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    return {
      user,
      token: await this.jwtService.signAsync(payload),
    };
  }

  async forgetPassword(email: string) {
    // 1) check if email exists
    console.log(email);

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    // 2) Generate a reset code and store it in the database
    const resetCode = crypto.randomBytes(3).toString('hex');
    const hashedResetCode = await bcrypt.hash(resetCode, 10); // hashed for DB

    user.resetCode = hashedResetCode;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    user.resetCodeVerified = false;
    await user.save();

    // 3) Send the reset code to the user's email
    const subject = 'Reset Your Password - Mafqood App';
    const text = `Hello ${user.name || 'User'},

We received a request to reset your password.
Your reset code is: ${resetCode}

If you did not request this, please ignore this email.

Best regards,
The Mafqood Team
`;

    const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color:#2c3e50;">Hello ${user.name || 'User'},</h2>
    <p>We received a request to reset your password.</p>
    <p>
      Your reset code is:
      <span style="font-size: 18px; font-weight: bold; color: #e74c3c;">
        ${resetCode}
      </span>
    </p>
    <p style="margin-top:20px;">If you did not request this, please ignore this email.</p>
    <br>
    <p>Best regards,<br><strong>Mafqood Team</strong></p>
  </div>
`;

    await this.EmailService.sendMail(user.email, subject, text, html);

    return {
      message: 'Password reset link has been sent to your email',
    };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user || !user.resetCode) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const isValid = await bcrypt.compare(code, user.resetCode);
    if (
      !isValid ||
      !user.resetCodeExpires ||
      user.resetCodeExpires < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }
    console.log(code, user.resetCode);

    user.resetCodeVerified = true;
    await user.save();

    return { message: 'Reset code verified successfully' };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user || !user.resetCodeVerified) {
      throw new UnauthorizedException('Reset code not verified');
    }

    // update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();

    // clear reset fields
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetCodeVerified = false;

    await user.save();

    return {
      message: 'Password has been reset successfully. Please login again.',
    };
  }
}
