import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ImpactService } from './impact.service';

@ApiTags('Impact')
@Controller('impact')
export class ImpactController {
  constructor(private service: ImpactService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Economic impact: import value, value-at-risk, concentration, estimated timing saving' })
  summary() {
    return this.service.summary();
  }

  @Put('config') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Tune impact assumptions (capture rate, risk threshold) — admin' })
  setConfig(@Body() body: { captureRate?: number; highRiskThreshold?: number }) {
    return this.service.setConfig(body);
  }
}
