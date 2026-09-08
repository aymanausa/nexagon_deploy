import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SimulationService } from './simulation.service';

@ApiTags('Simulation')
@Controller('simulation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SimulationController {
  constructor(private service: SimulationService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Available what-if scenario templates' })
  templates() {
    return this.service.templates();
  }

  @Post('run')
  @ApiOperation({ summary: 'Run a scenario — recompute index/demand/procurement impact + mitigations' })
  run(@Body() body: { key: string }) {
    return this.service.run(body.key);
  }
}
