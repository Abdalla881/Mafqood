import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Model } from 'mongoose';

import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { createClient } from 'redis';
import { ItemsService } from '../../../items/items.service';
import { CreateReportDto } from '../../../reports/dto/create-report.dto';
import { UpdateReportDto } from '../../../reports/dto/update-report.dto';
import { Report } from '../../interface/reports.interface';

@Injectable()
export class MyReportsService {
  constructor(
    @Inject('REPORT_MODEL')
    private reportModel: Model<Report>,
    private itemService: ItemsService,
    private cloudinaryService: CloudinaryService,
    @Inject('REDIS_CLIENT')
    private readonly redis: ReturnType<typeof createClient>,
  ) {}

  async createReport(
    data: CreateReportDto,
    userId: string,
    images?: Express.Multer.File[],
  ) {
    const session = await this.reportModel.db.startSession();
    session.startTransaction();
    try {
      const { item: itemData, ...reportFields } = data;

      const createdItem = await this.itemService.createItem(itemData, images);

      if (!createdItem) {
        throw new BadRequestException();
      }

      const createdReport = await this.reportModel.create({
        ...reportFields,
        reporter: new Types.ObjectId(userId),
        item: createdItem._id,
      });

      await session.commitTransaction();
      session.endSession();

      const report = await this.reportModel.findById(createdReport._id);

      if (!report) {
        throw new Error('Report not found after creation');
      }
      await this.redis.del(`user:${userId}:reports`);

      return {
        message: `Report Created successfully `,
        data: report,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async findOne(reportId) {
    const report = await this.reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundException(`Not find report with this Id ${reportId}`);
    }

    return { message: 'Get report with id ${reportId}', data: report };
  }

  async findMyReports(userId: string) {
    const key = `user:${userId}:reports`;
    const cached = await this.redis.get(key);

    if (cached) {
      const reports = JSON.parse(cached);
      return {
        message: 'Get My Reports Successfully (from cache)',
        count: reports.length,
        data: reports,
      };
    }
    const reports = await this.reportModel
      .find({ reporter: userId })
      .populate({
        path: 'item',
        populate: { path: 'category', select: 'name' },
      })
      .populate('reporter', 'name email')
      .lean();

    if (reports.length === 0) {
      throw new NotFoundException('You have no reports');
    }
    await this.redis.set(key, JSON.stringify(reports), {
      EX: 60 * 60, // Cache for 1 hour
    });

    return {
      message: 'Get My Reports Successfully',
      count: reports.length,
      data: reports,
    };
  }

  async updateMyReport(
    reportId: string,
    userId: string,
    updateDto: UpdateReportDto,
    images?: Express.Multer.File[],
  ) {
    const session = await this.reportModel.db.startSession();
    session.startTransaction();

    try {
      const report = await this.reportModel
        .findOne({ _id: reportId, reporter: userId })
        .populate('item')
        .session(session);

      if (!report) {
        throw new NotFoundException('Report not found or not authorized');
      }

      if (updateDto.item || images?.length) {
        await this.itemService.update(
          report.item._id.toString(),
          updateDto.item ?? {},
          images,
          session,
        );
      }

      const updatedReport = await this.reportModel
        .findOneAndUpdate(
          { _id: reportId, reporter: userId },
          { $set: { ...updateDto, item: report.item._id } },
          { new: true, session },
        )
        .populate({
          path: 'item',
          populate: { path: 'category', select: 'name' },
        })
        .populate('reporter', 'name email');

      await session.commitTransaction();
      session.endSession();
      await this.redis.del(`user:${userId}:reports`);

      return {
        message: 'Report updated successfully',
        data: updatedReport,
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async deleteMyReport(reportId: string, userId: string) {
    const session = await this.reportModel.db.startSession();
    session.startTransaction();

    try {
      const report = await this.reportModel
        .findOne({ _id: reportId, reporter: userId })
        .populate('item')
        .session(session);

      if (!report) {
        throw new NotFoundException('Report not found or not authorized');
      }

      if (report.item?._id) {
        await this.itemService.delete(report.item._id.toString());
      }

      await this.reportModel.findByIdAndDelete(reportId).session(session);

      await session.commitTransaction();
      session.endSession();

      await this.redis.del(`user:${userId}:reports`);

      return {
        message: 'Report and associated item/images deleted successfully',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
