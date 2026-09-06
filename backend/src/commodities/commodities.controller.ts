import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommoditiesService } from './commodities.service';
import { CreatePriceDto } from './dto/commodity.dto';

@ApiTags('Commodities')
@Controller('commodities')
export class CommoditiesController {
  constructor(private service: CommoditiesService) {}

  @Get('prices') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commodity prices' })
  async getPrices(@Query('commodity') commodity?: string, @Query('source') source?: string) {
    return this.service.getPrices(commodity, source);
  }

  @Get('available') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List commodities that have price data' })
  async getAvailable() {
    return this.service.getAvailable();
  }

  @Post('prices') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Record new price' })
  async createPrice(@Body() dto: CreatePriceDto) {
    return this.service.createPrice(dto);
  }

  @Get('stocks') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get stock levels' })
  async getStocks() { return this.service.getStocks(); }

  @Get('suppliers') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supplier countries' })
  async getSuppliers(@Query('continent') continent?: string, @Query('riskLevel') riskLevel?: string) {
    return this.service.getSuppliers(continent, riskLevel);
  }

  @Get('suppliers/:code') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supplier detail' })
  async getSupplier(@Param('code') code: string) {
    return this.service.getSupplier(code);
  }
}
