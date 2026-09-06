import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FoodIndexService } from './food-index.service';

@ApiTags('Food Index')
@Controller('food-index')
export class FoodIndexController {
  constructor(private service: FoodIndexService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'KSA food-security composite index (4 pillars, 16 sub-indicators)' })
  list() {
    return this.service.list();
  }

  @Post('recompute') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Recompute the index from latest data (admin)' })
  recompute() {
    return this.service.compute();
  }
}
