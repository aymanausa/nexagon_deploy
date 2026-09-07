import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DemandService } from './demand.service';
import { DemandAssumptions } from './demand.constants';

@ApiTags('Demand')
@Controller('demand')
export class DemandController {
  constructor(private service: DemandService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: '12-month KSA demand projection per commodity (FBS baseline + Ramadan/Hajj seasonality)' })
  list() {
    return this.service.list();
  }

  @Get('assumptions') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Demand seasonality assumptions (tunable coefficients)' })
  getAssumptions() {
    return this.service.getAssumptions();
  }

  @Put('assumptions') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Update demand assumptions (admin) — reviewable by GASTAT/SAGO' })
  setAssumptions(@Body() body: Partial<DemandAssumptions>) {
    return this.service.setAssumptions(body);
  }

  @Post('refresh') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh demand baselines from FAO FBS + Comtrade (admin)' })
  refresh() {
    return this.service.refresh();
  }
}
