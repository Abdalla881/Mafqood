import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Model } from 'mongoose';
import { category } from './interface/categories.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MESSAGES } from '@nestjs/core/constants';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('CATEGORY_MODEL') private categoryModel: Model<category>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      message: `Get Category with id ${id} successfully `,
      data: category,
    };
  }

  async findAll() {
    const categories = await this.categoryModel.find();
    if (!categories) {
      throw new NotFoundException('No categories found');
    }
    return {
      message: 'Get All Categories successfully',
      length: categories.length,
      data: categories,
    };
  }
  async create(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const exists = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (exists) {
      throw new ConflictException('Category already exists');
    }

    let imageData: { public_id: string; url: string } | undefined;
    if (file) {
      const image = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      imageData = {
        public_id: image.public_id,
        url: image.secure_url,
      };
    }

    const categoryData: any = {
      ...createCategoryDto,
    };

    if (imageData) {
      categoryData.image = imageData;
    }

    const category = await this.categoryModel.create(categoryData);

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let imageData: { public_id: string; url: string } | undefined;

    if (file) {
      if (category.image?.public_id) {
        await this.cloudinaryService.deleteImage(category.image.public_id);
      }

      const image = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      imageData = {
        public_id: image.public_id,
        url: image.secure_url,
      };
    }

    const updateData: any = {
      ...updateCategoryDto,
    };

    if (imageData) {
      updateData.image = imageData;
    }

    const updated = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    return {
      message: `Update Category with id ${id} successfully `,
      data: category,
    };
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      message: `Remove Category with id ${id} successfully `,
      data: category,
    };
  }
}
