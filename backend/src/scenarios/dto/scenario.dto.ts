import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScenarioCategory, ScenarioSeverity } from '@prisma/client';

export class CreateScenarioDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: ScenarioCategory }) @IsEnum(ScenarioCategory) category: ScenarioCategory;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() triggerEvent: string;
  @ApiProperty({ enum: ScenarioSeverity }) @IsEnum(ScenarioSeverity) severity: ScenarioSeverity;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() impactedCommodities?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() duration?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() assumptions?: string[];
  @ApiProperty({ required: false }) @IsOptional() cascadingEffects?: any;
  @ApiProperty({ required: false }) @IsOptional() projectedOutcomes?: any;
  @ApiProperty({ required: false }) @IsOptional() mitigationOptions?: any;
}
