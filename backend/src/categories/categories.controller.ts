import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  Put,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MongoIdParam } from '../common/decorators/mongo-id-param.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../common/guard/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  // @desc Get ALl categories
  // @route GET api/v1/categories
  // @access public
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
  // @desc Get spcific category by id
  // @route GET api/v1/categories/:id
  // @access public
  @Get(':id')
  findOne(@MongoIdParam() @Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // @desc create new category
  // @route POST api/v1/categories
  // @access privet [admin]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.create(createCategoryDto, file);
  }

  // @desc update  category
  // @route PUT api/v1/categories/:id
  // @access privet [admin]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @MongoIdParam() @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, file);
  }

  // @desc Delete  category
  // @route Delete api/v1/categories/:id
  // @access privet [admin]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  remove(@MongoIdParam() @Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
