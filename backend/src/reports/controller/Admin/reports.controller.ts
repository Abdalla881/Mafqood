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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { MongoIdParam } from '../../../common/decorators/mongo-id-param.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ReportsService } from '../../../reports/service/Admin/reports.service';
import { QueryOptionsDto } from '../../../common//dto/query-options.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // @desc find report by id
  // @route GET api/v1/reports/:id
  // @access public
  @Get(':id')
  findOne(@MongoIdParam() @Param() reportId: string) {
    return this.reportsService.findOne(reportId);
  }

  // @desc find all reports
  // @route GET api/v1/reports
  // @access public
  @Get()
  findAll(@Query() query: QueryOptionsDto) {
    return this.reportsService.findAll(query);
  }

  // @desc delete report by id
  // @route DELETE api/v1/reports/:id
  // @access privet [admin]
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  delete(@MongoIdParam() @Param() reportId: string) {
    return this.reportsService.delete(reportId);
  }
}
