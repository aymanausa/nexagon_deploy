import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}
  @Post('generate') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate report' })
  async generate(@Body() dto: GenerateReportDto) { return this.service.generate(dto); }
  @Get('templates') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get templates' })
  async templates() { return this.service.getTemplates(); }
}
