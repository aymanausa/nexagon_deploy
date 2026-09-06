import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CatalogService } from './catalog.service';

@ApiTags('Commodity Catalog')
@Controller('commodities/catalog')
export class CatalogController {
  constructor(private service: CatalogService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List the commodity catalog' })
  list() {
    return this.service.list();
  }

  @Post('refresh') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Pull the FAO food catalog and refresh availability flags (admin)' })
  refresh() {
    return this.service.refresh();
  }

  @Patch(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Show/hide a commodity on the dashboard (admin)' })
  setShow(@Param('id') id: string, @Body('showOnDashboard') showOnDashboard: boolean) {
    return this.service.setShow(id, showOnDashboard);
  }
}
