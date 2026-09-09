import { Module } from '@nestjs/common';
import { SustainabilityService } from './sustainability.service';
import { SustainabilityController } from './sustainability.controller';

@Module({
  providers: [SustainabilityService],
  controllers: [SustainabilityController],
})
export class SustainabilityModule {}
