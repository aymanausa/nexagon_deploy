import { Module } from '@nestjs/common';
import { ImpactService } from './impact.service';
import { ImpactController } from './impact.controller';

@Module({
  providers: [ImpactService],
  controllers: [ImpactController],
})
export class ImpactModule {}
