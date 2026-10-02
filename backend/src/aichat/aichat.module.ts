import { Module } from '@nestjs/common';
import { AichatController } from './aichat.controller';
import { AichatService } from './aichat.service';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { FoodIndexModule } from '../food-index/food-index.module';
import { ImpactModule } from '../impact/impact.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [DashboardModule, ProcurementModule, FoodIndexModule, ImpactModule, NewsModule],
  controllers: [AichatController],
  providers: [AichatService],
})
export class AichatModule {}
