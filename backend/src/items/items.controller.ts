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
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { count } from 'console';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

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

  @Get()
  async findAll() {
    const items = await this.itemsService.findAll();
    return {
      message: 'Items fetched successfully',
      count: items.length,
      items,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.itemsService.findOne(id);
    if (!item) throw new NotFoundException('Item not found');
    return {
      message: 'Item fetched successfully',
      data: item,
    };
  }

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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.itemsService.delete(id);
    return {
      message: 'Item deleted successfully',
    };
  }
}
