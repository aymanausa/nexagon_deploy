import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('kpis')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  async getKpis() {
    return this.service.getKpis();
  }

  @Get('prices/latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest commodity prices' })
  async getLatestPrices() {
    return this.service.getLatestPrices();
  }

  @Get('alerts/recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent alerts' })
  async getRecentAlerts() {
    return this.service.getRecentAlerts();
  }

  @Get('automation/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get self-running pipeline freshness (durability strip)' })
  async getAutomationStatus() {
    return this.service.getAutomationStatus();
  }
}
