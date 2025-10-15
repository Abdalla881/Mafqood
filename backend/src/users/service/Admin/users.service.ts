import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from '../../dto/Admin/create-user.dto';
import { UpdateUserDto } from '../../dto/Admin/update-user.dto';
import { user } from '../../interfaces/user.interface';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<user>,
    private jwtService: JwtService,
  ) {}

  // find By Id for jwt.Startgy
  async findByIdRaw(id: string) {
    return await this.userModel.findById(id);
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.exists({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.userModel.create(createUserDto);

    return {
      message: 'user created successfully',
      data: newUser,
    };
  }

  async findAll() {
    const users = await this.userModel.find().select('-password').exec();
    if (!users) {
      throw new NotFoundException('No users found');
    }
    return { message: 'Get All user successfully', users };
  }

  async findOne(id: string) {
    console.log(id);

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      message: `Get user with id ${id} successfully `,
      data: user,
    };
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `Update user with id ${id} successfully `, data: user };
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: `Delete user with id ${id} successfully `,
      data: user,
    };
  }
}
