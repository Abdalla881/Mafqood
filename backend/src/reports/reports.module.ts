import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/DataBase/database.module';
import { reportsProviders } from './reports.providers';
import { MyReportsService } from './service/Users/myReports.service';
import { MyReportsController } from './controller/Users/myReports.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { itemsProviders } from 'src/items/items.providers';
import { ItemsModule } from 'src/items/items.module';
import { ReportsService } from './service/Admin/reports.service';
import { ReportsController } from './controller/Admin/reports.controller';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CloudinaryModule,
    ItemsModule,
  ],
  controllers: [MyReportsController, ReportsController],
  providers: [
    ...reportsProviders,
    ...itemsProviders,
    MyReportsService,
    ReportsService,
  ],
})
export class ReportsModule {}
