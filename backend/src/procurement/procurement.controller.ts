import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProcurementService } from './procurement.service';
import { ProcurementConfig } from './procurement.constants';

@ApiTags('Procurement')
@Controller('procurement')
export class ProcurementController {
  constructor(private service: ProcurementService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Procurement recommendations (buy/hold/defer) per commodity + portfolio brief' })
  list() {
    return this.service.list();
  }

  @Post('recompute') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Recompute recommendations from latest signals (admin)' })
  recompute() {
    return this.service.compute();
  }

  @Put('config') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Update procurement config (lead time, thresholds) — admin' })
  setConfig(@Body() body: Partial<ProcurementConfig>) {
    return this.service.setConfig(body);
  }
}
