import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Item } from './interface/items.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @Inject('ITEM_MODEL')
    private itemModel: Model<Item>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createItem(itemData: CreateItemDto, images?: Express.Multer.File[]) {
    if (images && images.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    const uploadedImages = images?.length
      ? await this.cloudinaryService.uploadImages(images, 'reports', 5)
      : [];

    const createdItem = await this.itemModel.create({
      ...itemData,
      images: uploadedImages,
    });

    if (!createdItem) {
      throw new BadRequestException('Item not created');
    }

    return createdItem.toJSON();
  }

  async findOne(itemId: string) {
    const item = await this.itemModel
      .findById(itemId)
      .populate('category', 'name')
      .exec();

    if (!item) {
      throw new NotFoundException('item not found');
    }

    return item;
  }

  async findAll() {
    const items = await this.itemModel
      .find()
      .populate('category', 'name -_id')
      .exec();

    if (items.length === 0) {
      throw new NotFoundException('no items found');
    }

    return items;
  }

  async update(
    itemId: string,
    data: UpdateItemDto,
    images?: Express.Multer.File[],
    session?: any,
  ) {
    const existing = await this.itemModel.findById(itemId).session(session);
    if (!existing) throw new NotFoundException('item not found');

    const uploadedImages = images?.length
      ? await this.cloudinaryService.uploadImages(images, 'reports', 5)
      : [];

    if ((existing.images?.length || 0) + uploadedImages.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    const item = await this.itemModel
      .findByIdAndUpdate(
        itemId,
        {
          ...data,
          images: [...(existing.images || []), ...uploadedImages],
        },
        { new: true, session },
      )
      .populate('category', 'name -_id');

    return item;
  }

  async delete(itemId: string) {
    const item = await this.itemModel.findById(itemId);

    if (!item) {
      throw new NotFoundException('item not found');
    }
    if ((item.images?.length ?? 0) > 0) {
      const publicIds = (item.images ?? [])
        .map((img) => img.public_id)
        .filter(Boolean);

      if (publicIds.length > 0) {
        await this.cloudinaryService.deleteImages(publicIds);
      }
    }

    await this.itemModel.findByIdAndDelete(itemId);

    return {
      message: 'Item and its images deleted successfully',
      data: { id: item._id, name: item.name },
    };
  }
}
