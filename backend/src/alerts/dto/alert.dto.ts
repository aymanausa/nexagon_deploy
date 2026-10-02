import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertLevel, AlertCategory } from '@prisma/client';

export class CreateAlertDto {
  @ApiProperty({ enum: AlertLevel }) @IsEnum(AlertLevel) level: AlertLevel;
  @ApiProperty({ enum: AlertCategory }) @IsEnum(AlertCategory) category: AlertCategory;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() source: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() metric?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() currentValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() thresholdValue?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() recommendedAction?: string;
}
