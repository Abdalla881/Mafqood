import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  Req,
  UseInterceptors,
  Put,
} from '@nestjs/common';

import { UserMeService } from '../../service/userMe/user-me.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateUserDto } from 'src/users/dto/Admin/update-user.dto';

@Controller('users/me')
export class UserMeController {
  constructor(private readonly userMeService: UserMeService) {}

  //@desc Get current user profile
  //@ route GET /api/users/me/profile
  //@access Private
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  myProfile(@Req() req) {
    return this.userMeService.myProfile(req.user.id);
  }

  //@desc Upload or update user avatar
  //@ route POST /api/users/me/avatar
  //@access Private
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.userMeService.uploadAvatar(req.user.id, file);
  }

  // @desc Update user profile
  // @ route PUT /api/users/me/profile
  // @access Private
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req, @Body() updateData: UpdateUserDto) {
    return this.userMeService.updateProfile(req.user.id, updateData);
  }

  //desc change user password
  // route PUT /api/users/me/password
  // access Private
  @Put('password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req, @Body() body) {
    return this.userMeService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
