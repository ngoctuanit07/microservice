import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    // @ts-ignore
    return (this.prisma as any).transaction.findMany({ orderBy: { date: 'desc' } });
  }

  async create(data: CreateTransactionDto) {
    // Ensure date is a JS Date when provided as a string
    const payload: any = { ...data };
    if (payload.date && typeof payload.date === 'string') {
      payload.date = new Date(payload.date);
    }
    // @ts-ignore - Prisma client typing for dynamic model access
    return (this.prisma as any).transaction.create({ data: payload });
  }

  async update(id: number, data: UpdateTransactionDto) {
    const payload: any = { ...data };
    if (payload.date && typeof payload.date === 'string') {
      payload.date = new Date(payload.date);
    }
    // @ts-ignore - Prisma client typing for dynamic model access
    return (this.prisma as any).transaction.update({ where: { id }, data: payload });
  }

  async delete(id: number) {
    // @ts-ignore
    return (this.prisma as any).transaction.delete({ where: { id } });
  }
}
