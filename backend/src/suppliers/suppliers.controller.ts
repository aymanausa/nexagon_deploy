import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Food supplier countries (UN Comtrade import flows)' })
  list() {
    return this.service.list();
  }

  @Post('refresh') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('INSTITUTION_ADMIN') @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh supplier flows (Comtrade) + risk (WGI) + climate (NASA POWER) (admin)' })
  refresh() {
    return this.service.refreshFull();
  }
}
