import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IngestionService } from './ingestion.service';

@ApiTags('Integration')
@Controller('integration')
export class IntegrationController {
  constructor(private ingestion: IngestionService) {}

  @Post('sources/:id/run') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger an immediate fetch for a data source' })
  async run(@Param('id') id: string) {
    return this.ingestion.runSource(id);
  }
}
