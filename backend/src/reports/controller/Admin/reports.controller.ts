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
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { MongoIdParam } from 'src/common/decorators/mongo-id-param.decorator';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ReportsService } from 'src/reports/service/Admin/reports.service';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id')
  findOne(@MongoIdParam() @Param() reportId: string) {
    return this.reportsService.findOne(reportId);
  }
  @Get()
  findAll(@Query() query: QueryOptionsDto) {
    return this.reportsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  delete(@MongoIdParam() @Param() reportId: string) {
    return this.reportsService.delete(reportId);
  }
}
