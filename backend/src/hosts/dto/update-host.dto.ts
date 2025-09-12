import { PartialType } from '@nestjs/mapped-types';
import { CreateHostDto } from './create-host.dto';
import { IsDateString, IsInt, IsIP, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateHostDto extends PartialType(CreateHostDto) {
  @IsOptional() @IsString() @IsIP() ip?: string;
  @IsOptional() @IsInt() @Min(1) @Max(65535) port?: number;
  @IsOptional() @IsString() uid?: string;
  @IsOptional() @IsString() pwd?: string;
  @IsOptional() @IsDateString() purchasedAt?: string;
  @IsOptional() @IsDateString() expiredAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsInt() userId?: number;
}
