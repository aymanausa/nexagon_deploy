import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SustainabilityService } from './sustainability.service';

@ApiTags('Sustainability')
@Controller('sustainability')
export class SustainabilityController {
  constructor(private service: SustainabilityService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Sustainability footprint of food imports: virtual water + shipping CO₂' })
  summary() {
    return this.service.summary();
  }
}
