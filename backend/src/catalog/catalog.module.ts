import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { IntegrationModule } from '../integration/integration.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [IntegrationModule, SuppliersModule], // IngestionService (force-fetch) + SuppliersService (auto-refresh trade flows)
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
