import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  @ApiOperation({ summary: 'Run a scenario by template key, or a custom {shocks} payload' })
  run(@Body() body: { key?: string; shocks?: any; name?: string }) {
    if (body.shocks) return this.service.runCustom(body.shocks, body.name);
    return this.service.run(body.key!);
  }

  @Post('run-nl')
  @ApiOperation({ summary: 'Describe a what-if in natural language → Claude translates → simulate' })
  runNl(@Body() body: { prompt: string }) {
    return this.service.runNl(body.prompt);
  }

  @Get('auto')
  @ApiOperation({ summary: 'List auto-detected scenarios (from live signals)' })
  listAuto() {
    return this.service.listAuto();
  }

  @Post('auto-generate') @UseGuards(RolesGuard) @Roles('INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Scan signals and auto-generate material scenarios + alerts + initiatives (admin)' })
  autoGenerate() {
    return this.service.autoGenerate();
  }
}
