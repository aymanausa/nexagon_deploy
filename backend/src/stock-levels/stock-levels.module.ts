import { Module } from '@nestjs/common';
import { StockLevelsService } from './stock-levels.service';
import { StockLevelsController } from './stock-levels.controller';

@Module({
  controllers: [StockLevelsController],
  providers: [StockLevelsService],
})
export class StockLevelsModule {}
