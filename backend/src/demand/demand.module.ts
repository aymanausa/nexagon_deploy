import { Module } from '@nestjs/common';
import { DemandService } from './demand.service';
import { DemandController } from './demand.controller';

@Module({
  providers: [DemandService],
  controllers: [DemandController],
  exports: [DemandService],
})
export class DemandModule {}
