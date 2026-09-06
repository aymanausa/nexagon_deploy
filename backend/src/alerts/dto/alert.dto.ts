import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty() @IsEnum(['GREEN', 'AMBER', 'RED', 'BLACK']) level: string;
  @ApiProperty() @IsEnum(['PRICE', 'SUPPLY', 'LOGISTICS', 'CLIMATE', 'GEOPOLITICAL', 'QUALITY', 'SYSTEM']) category: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() source: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() metric?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() currentValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() thresholdValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() recommendedAction?: string;
}
