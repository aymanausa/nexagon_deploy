import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class GenerateReportDto {
  @ApiProperty({ enum: ['daily','weekly','monthly','quarterly','custom'] }) @IsString() reportType: string;
  @ApiProperty() @IsString() dateFrom: string;
  @ApiProperty() @IsString() dateTo: string;
  @ApiProperty() @IsArray() sections: string[];
  @ApiProperty({ enum: ['pdf','excel','html'] }) @IsString() format: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() language?: string;
}
