import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { DemandModule } from '../demand/demand.module';

@Module({
  imports: [DemandModule], // for DemandService (baseline projections)
  providers: [SimulationService],
  controllers: [SimulationController],
})
export class SimulationModule {}
