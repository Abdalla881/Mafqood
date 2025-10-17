import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { itemsProviders } from './items.providers';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DatabaseModule } from '../DataBase/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CloudinaryModule,
  ],
  controllers: [ItemsController],
  providers: [...itemsProviders, ItemsService],

  exports: [ItemsService],
})
export class ItemsModule {}
