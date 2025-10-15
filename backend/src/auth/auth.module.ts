import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/DataBase/database.module';
import { AuthController } from './Controller/auth.controller';
import { AuthService } from './service/auth.service';
import { UserProviders } from '../users/users.providers';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/service/Admin/users.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [...UserProviders, UsersService, AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
