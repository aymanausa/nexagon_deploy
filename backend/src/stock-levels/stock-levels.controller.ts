import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StockLevelsService } from './stock-levels.service';

@ApiTags('Stock Levels')
@Controller('stock-levels')
export class StockLevelsController {
  constructor(private service: StockLevelsService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Strategic reserve stock levels (USDA PSD)' })
  list() {
    return this.service.list();
  }

  @Get('thresholds') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Status colour-band thresholds (days of supply)' })
  getThresholds() {
    return this.service.getThresholds();
  }

  @Put('thresholds') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status thresholds and re-colour reserves (admin)' })
  setThresholds(@Body() body: { adequateDays: number; watchDays: number }) {
    return this.service.setThresholds(body);
  }

  @Post('refresh') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh stock levels from USDA PSD (admin)' })
  refresh() {
    return this.service.refresh();
  }
}
