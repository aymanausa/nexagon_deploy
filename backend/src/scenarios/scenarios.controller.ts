import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/scenario.dto';

@ApiTags('Scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private service: ScenariosService) {}

  @Get() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List scenarios' })
  async list(@Query('category') category?: string) { return this.service.findAll(category); }

  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create scenario' })
  async create(@Body() dto: CreateScenarioDto) { return this.service.create(dto); }

  @Get('risk-domains') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get 12 risk domains' })
  async getDomains() { return this.service.getRiskDomains(); }

  @Get('initiatives') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get initiatives' })
  async getInitiatives(@Query('category') category?: string) { return this.service.getInitiatives(category); }

  @Get(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get scenario by ID' })
  async getById(@Param('id') id: string) { return this.service.findById(id); }
}
