import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { count } from 'console';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // @desc create new item
  // @route POST api/v1/items
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  @Post()
  async create(
    @Body() itemData: CreateItemDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const item = await this.itemsService.createItem(itemData, images);
    return {
      message: 'Item created successfully',
      data: item,
    };
  }

  // @desc GET All items
  // @route GET api/v1/items
  // @access public
  @Get()
  async findAll() {
    const items = await this.itemsService.findAll();
    return {
      message: 'Items fetched successfully',
      count: items.length,
      items,
    };
  }
  // @desc GET spcicific item by id
  // @route GET api/v1/items/:id
  // @access public
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.itemsService.findOne(id);
    if (!item) throw new NotFoundException('Item not found');
    return {
      message: 'Item fetched successfully',
      data: item,
    };
  }

  // @desc update ny item
  // @route Put api/v1/items
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() itemData: UpdateItemDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const item = await this.itemsService.update(id, itemData, images);
    return {
      message: 'Item updated successfully',
      data: item,
    };
  }
  // @desc Delete my item
  // @route Delete api/v1/items
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.itemsService.delete(id);
    return {
      message: 'Item deleted successfully',
    };
  }
}
