import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { log } from 'console';

@Injectable()
export class GoogleStrategyImpl extends PassportStrategy(
  GoogleStrategy,
  'google',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    if (!profile.emails || profile.emails.length === 0) {
      throw new UnauthorizedException('No email associated with this account!');
    }

    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      googleId: profile.id,
      name: profile.displayName,
    });

    return user;
  }
}
