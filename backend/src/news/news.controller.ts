import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private service: NewsService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Food-security news signals + daily AI brief (GDELT + Claude)' })
  list() {
    return this.service.list();
  }

  @Post('refresh') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Pull GDELT + reclassify + rebuild brief (admin)' })
  refresh() {
    return this.service.refresh();
  }
}
