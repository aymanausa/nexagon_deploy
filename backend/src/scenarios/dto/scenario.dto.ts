import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScenarioDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: ['STRATEGIC', 'OPERATIONAL'] }) @IsEnum(['STRATEGIC', 'OPERATIONAL']) category: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() triggerEvent: string;
  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] }) @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']) severity: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() impactedCommodities?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() duration?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() assumptions?: string[];
  @ApiProperty({ required: false }) @IsOptional() cascadingEffects?: any;
  @ApiProperty({ required: false }) @IsOptional() projectedOutcomes?: any;
  @ApiProperty({ required: false }) @IsOptional() mitigationOptions?: any;
}
