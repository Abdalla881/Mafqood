import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '../DataBase/database.module';
import { CategoryProviders } from './categories.provider';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [...CategoryProviders, CategoriesService, CloudinaryService],
})
export class CategoriesModule {}
