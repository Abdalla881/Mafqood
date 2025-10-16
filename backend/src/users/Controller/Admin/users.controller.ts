import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../service/Admin/users.service';
import { CreateUserDto } from '../../dto/Admin/create-user.dto';
import { UpdateUserDto } from '../../dto/Admin/update-user.dto';

import { MongoIdParam } from '../../../common/decorators/mongo-id-param.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //@desc create a new user
  // @route POST /api/v1/users
  // @access private[admin]

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);

    return this.usersService.create(createUserDto);
  }

  //@desc get all users
  // @route GET /api/v1/users
  // @access private[admin]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  //@desc get all users
  // @route GET /api/v1/users
  // @access private[admin]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Get(':id')
  findOne(@MongoIdParam() @Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //@desc update user by id
  // @route GET /api/v1/users
  // @access private[admin , manager]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'manager'])
  @Patch(':id')
  update(
    @MongoIdParam() @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  //@desc get all users
  // @route GET /api/v1/users
  // @access private[admin , manager]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin', 'manager'])
  @Delete(':id')
  remove(@MongoIdParam() @Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
