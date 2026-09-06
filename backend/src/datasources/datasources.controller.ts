import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatasourcesService } from './datasources.service';
@ApiTags('Data Sources')
@Controller('data-sources')
export class DatasourcesController {
  constructor(private service: DatasourcesService) {}
  @Get('health') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get source health' })
  async health() { return this.service.getHealth(); }
  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List sources' })
  async list(@Query('category') cat?: string, @Query('status') st?: string) { return this.service.findAll(cat, st); }
}
