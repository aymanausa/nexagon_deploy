import { Module } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { DemandModule } from '../demand/demand.module';

@Module({
  imports: [DemandModule], // for DemandService (demand projections)
  providers: [ProcurementService],
  controllers: [ProcurementController],
})
export class ProcurementModule {}
