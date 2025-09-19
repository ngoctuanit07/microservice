import { Type } from 'class-transformer';
import { IsString, IsEnum, IsNumber, IsPositive, IsDateString } from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateTransactionDto {
  @IsString()
  name!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsDateString()
  date!: string;
}
