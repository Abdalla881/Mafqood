import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { user } from '../../interfaces/user.interface';
import { Model } from 'mongoose';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { UpdateUserDto } from '../../../users/dto/Admin/update-user.dto';

@Injectable()
export class UserMeService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<user>,
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

  //@desc Get current user profile
  //@ route GET /api/users/me/profile
  //@access Private
  async myProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `Get user profile with id : ${userId} successfully `,
      data: user,
    };
  }

  // @desc Update user profile
  // @ route PUT /api/users/me/profile
  // @access Private
  async updateProfile(userId: string, updateData: UpdateUserDto) {
    console.log(updateData);

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        email: updateData.email,
        name: updateData.name,
        phone: updateData.phone,
        age: updateData.age,
      },
      {
        new: true,
      },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: `Update user profile with id : ${userId} successfully `,
      data: user,
    };
  }

  //@desc Upload or update user avatar
  //@ route POST /api/users/me/avatar
  //@access Private
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.avatar?.public_id) {
      await this.cloudinaryService.deleteImage(user.avatar.public_id);
    }

    const uploadedImage = await this.cloudinaryService.uploadImage(
      file,
      'users',
    );

    user.avatar = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };

    await user.save();

    return {
      message: `Get user avatar with id : ${userId} successfully `,
      data: user,
    };
  }

  //@desc Change user password
  //@route PUT /api/users/me/password
  //@access Private
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User not found');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Set new password
    user.password = newPassword; // bcrypt hook should hash this
    user.passwordChangedAt = new Date(Date.now() - 1000);

    await user.save();

    return {
      message: 'Password updated successfully, please login again',
      data: user,
    };
  }
}
