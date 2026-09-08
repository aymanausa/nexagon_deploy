import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InitiativesService } from './initiatives.service';

@ApiTags('Initiatives')
@Controller('initiatives')
export class InitiativesController {
  constructor(private service: InitiativesService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List initiatives (auto-suggested + manual, with status)' })
  list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a manual initiative' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Patch(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an initiative (status / priority / owner)' })
  update(@Param('id') id: string, @Body() dto: { status?: string; priority?: string; responsibleEntity?: string }) {
    return this.service.update(id, dto);
  }

  @Post('generate') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate auto-suggested initiatives from current findings (admin)' })
  generate() {
    return this.service.generate();
  }
}
