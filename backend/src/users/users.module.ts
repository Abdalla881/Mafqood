import { Module } from '@nestjs/common';
import { UsersService } from './service/Admin/users.service';
import { UsersController } from './Controller/Admin/users.controller';
import { UserProviders } from './users.providers';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserMeService } from './service/userMe/user-me.service';
import { UserMeController } from './Controller/userMe/user-me.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DatabaseModule } from '../DataBase/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CloudinaryModule,
  ],
  controllers: [UserMeController, UsersController],
  providers: [...UserProviders, UsersService, UserMeService],
  exports: [UsersService],
})
export class UsersModule {}
