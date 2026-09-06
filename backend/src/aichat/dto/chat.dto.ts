import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChatRequestDto {
  @ApiProperty() @IsString() message: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() language?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() conversationId?: string;
}
