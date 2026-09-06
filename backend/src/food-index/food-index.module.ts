import { Module } from '@nestjs/common';
import { FoodIndexService } from './food-index.service';
import { FoodIndexController } from './food-index.controller';

@Module({
  providers: [FoodIndexService],
  controllers: [FoodIndexController],
})
export class FoodIndexModule {}
