import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LiveDataService } from './live-data.service';

@ApiTags('Live Data')
@Controller('live-data')
export class LiveDataController {
  constructor(private service: LiveDataService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Live datasets we fetch and where each is used' })
  list() {
    return this.service.list();
  }
}
