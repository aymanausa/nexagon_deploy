import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/alert.dto';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private service: AlertsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List alerts with filtering' })
  async list(@Query('level') level?: string, @Query('category') category?: string, @Query('isRead') isRead?: string) {
    return this.service.findAll({ level, category, isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create alert' })
  async create(@Body() dto: CreateAlertDto) {
    return this.service.create(dto);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get alert counts' })
  async getCounts() {
    return this.service.getCounts();
  }

  @Post(':id/acknowledge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Acknowledge alert' })
  async acknowledge(@Param('id') id: string, @Body('acknowledgedBy') by: string) {
    return this.service.acknowledge(id, by);
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark alert as read' })
  async markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }
}
