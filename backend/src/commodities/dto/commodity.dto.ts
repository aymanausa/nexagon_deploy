import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceDto {
  @ApiProperty() @IsString() commodity: string;
  @ApiProperty() @IsNumber() priceUsd: number;
  @ApiProperty() @IsNumber() priceSar: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() changePercent?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() forecast30d?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() forecast90d?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() confidenceScore?: number;
  @ApiProperty() @IsString() source: string;
}
