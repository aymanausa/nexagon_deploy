import { Module } from '@nestjs/common';
import { SelfSufficiencyService } from './self-sufficiency.service';
import { SelfSufficiencyController } from './self-sufficiency.controller';

@Module({
  controllers: [SelfSufficiencyController],
  providers: [SelfSufficiencyService],
})
export class SelfSufficiencyModule {}
