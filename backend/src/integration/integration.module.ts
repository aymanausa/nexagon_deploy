import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IntegrationController } from './integration.controller';
import { FaoPricesFetcher } from './fetchers/fao-prices.fetcher';
import { WorldBankPricesFetcher } from './fetchers/worldbank-prices.fetcher';

@Module({
  controllers: [IntegrationController],
  providers: [IngestionService, FaoPricesFetcher, WorldBankPricesFetcher],
  exports: [IngestionService],
})
export class IntegrationModule {}
