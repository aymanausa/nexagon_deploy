import { Module } from '@nestjs/common';
import { LiveDataService } from './live-data.service';
import { LiveDataController } from './live-data.controller';

@Module({
  controllers: [LiveDataController],
  providers: [LiveDataService],
})
export class LiveDataModule {}
