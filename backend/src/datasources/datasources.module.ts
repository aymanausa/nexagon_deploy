import { Module } from '@nestjs/common';
import { DatasourcesController } from './datasources.controller';
import { DatasourcesService } from './datasources.service';
@Module({ controllers: [DatasourcesController], providers: [DatasourcesService] })
export class DatasourcesModule {}
