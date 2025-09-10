// backend/src/hosts/dto/create-host.dto.ts
import { IsDateString, IsInt, IsIP, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateHostDto {
  @IsString() @IsIP() ip!: string;
  @IsInt() @Min(1) @Max(65535) port!: number;
  @IsString() uid!: string;
  @IsString() pwd!: string; // plaintext from client, will be encrypted server-side
  @IsDateString() purchasedAt!: string;
  @IsDateString() expiredAt!: string;
  @IsOptional() @IsString() notes?: string;
}
