import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InsightsService } from './insights.service';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private service: InsightsService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'AI-generated insights for a dashboard' })
  get(@Query('context') context = 'dashboard', @Query('focus') focus?: string) {
    return this.service.getInsights(context, focus);
  }
}
