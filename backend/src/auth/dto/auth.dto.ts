import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() mfaCode?: string;
}

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty({ enum: ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_MANAGER', 'ANALYST', 'VIEWER', 'GUEST'] })
  @IsOptional() @IsString() role?: string;
}
