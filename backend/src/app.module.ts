import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AlertsModule } from './alerts/alerts.module';
import { CommoditiesModule } from './commodities/commodities.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { DatasourcesModule } from './datasources/datasources.module';
import { AichatModule } from './aichat/aichat.module';
import { ReportsModule } from './reports/reports.module';
import { WebsocketModule } from './websocket/websocket.module';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegrationModule } from './integration/integration.module';
import { CatalogModule } from './catalog/catalog.module';
import { InsightsModule } from './insights/insights.module';
import { LiveDataModule } from './live-data/live-data.module';
import { SelfSufficiencyModule } from './self-sufficiency/self-sufficiency.module';
import { StockLevelsModule } from './stock-levels/stock-levels.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { FoodIndexModule } from './food-index/food-index.module';
import { NewsModule } from './news/news.module';
import { DemandModule } from './demand/demand.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    AlertsModule,
    CommoditiesModule,
    ScenariosModule,
    DatasourcesModule,
    AichatModule,
    ReportsModule,
    WebsocketModule,
    DashboardModule,
    IntegrationModule,
    CatalogModule,
    InsightsModule,
    LiveDataModule,
    SelfSufficiencyModule,
    StockLevelsModule,
    SuppliersModule,
    FoodIndexModule,
    NewsModule,
    DemandModule,
  ],
})
export class AppModule {}
