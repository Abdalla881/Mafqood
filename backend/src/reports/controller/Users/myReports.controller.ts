import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { CreateReportDto } from '../../../reports/dto/create-report.dto';
import { UpdateReportDto } from '../../../reports/dto/update-report.dto';
import { MyReportsService } from '../../../reports/service/Users/myReports.service';

@Controller('reports/me')
export class MyReportsController {
  constructor(private readonly reportsService: MyReportsService) {}

  // @desc create new report
  // @route POST api/v1/reports/me
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  @Post()
  create(
    @Body() reportdata: CreateReportDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.reportsService.createReport(reportdata, req.user.id, files);
  }

  // @desc find my report
  // @route GET api/v1/reports/me
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @Get('')
  findMyReports(@Req() req) {
    return this.reportsService.findMyReports(req.user.id);
  }

  // @desc update spacific report
  // @route PUt api/v1/reports/me/:id
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  @Put(':id')
  async updateMyReport(
    @Param('id') reportId: string,
    @Req() req,
    @Body() updateDto: UpdateReportDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.reportsService.updateMyReport(
      reportId,
      req.user.id,
      updateDto,
      images,
    );
  }

  // @desc Delete spacific report
  // @route DELETE api/v1/reports/me/:id
  // @access privet(user)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMyReport(@Param('id') reportId: string, @Req() req) {
    return this.reportsService.deleteMyReport(reportId, req.user.id);
  }
}
