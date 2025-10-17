import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';

import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { QueryOptionsDto } from '../../../common/dto/query-options.dto';
import { paginateAndFilter } from '../../../common/utils/query.util';
import { ItemsService } from '../../../items/items.service';
import { Report } from '../../interface/reports.interface';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('REPORT_MODEL')
    private reportModel: Model<Report>,
    private itemService: ItemsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findOne(reportId) {
    const report = await this.reportModel
      .findById(reportId)
      .populate({
        path: 'item',
        populate: { path: 'category', select: 'name -_id ' },
      })
      .populate('reporter', 'name email -_id');
    if (!report) {
      throw new NotFoundException(`Not find report with this Id ${reportId}`);
    }

    return { message: `Get report with id ${reportId}`, report };
  }

  async findAll(options: QueryOptionsDto) {
    const searchableFields = ['title'];

    console.log(options);

    const result = await paginateAndFilter(
      this.reportModel,
      options,
      {},
      searchableFields,
    );

    const reports = await this.reportModel.populate(result.data, {
      path: 'item',
      populate: { path: 'category', select: 'name -_id' },
    });

    if (result.total === 0) {
      throw new NotFoundException('Not found any reports');
    }

    return {
      message: 'Get All Reports Successfully',
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      reports,
    };
  }

  async delete(reportId) {
    const report = await this.reportModel.findByIdAndDelete(reportId);

    if (!report) {
      throw new NotFoundException(`Not find report with this Id ${reportId}`);
    }

    return { message: `Delete report with id ${reportId} successfuly` };
  }
}
