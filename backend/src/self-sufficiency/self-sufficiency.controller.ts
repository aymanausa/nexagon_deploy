import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SelfSufficiencyService } from './self-sufficiency.service';

@ApiTags('Self-Sufficiency')
@Controller('self-sufficiency')
export class SelfSufficiencyController {
  constructor(private service: SelfSufficiencyService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'KSA vs GCC self-sufficiency ratios (FAO FBS)' })
  list() {
    return this.service.list();
  }

  @Post('refresh') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Recompute self-sufficiency from FAO (admin)' })
  refresh() {
    return this.service.refresh();
  }
}
