import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    // @ts-ignore
    return (this.prisma as any).transaction.findMany({ orderBy: { date: 'desc' } });
  }

  async create(data: { name: string; type: string; amount: number; date: Date }) {
    // Ensure date is a JS Date when provided as a string
    const payload: any = { ...data };
    if (payload.date && typeof payload.date === 'string') {
      payload.date = new Date(payload.date);
    }
    // @ts-ignore
    return (this.prisma as any).transaction.create({ data: payload });
  }

  async update(id: number, data: { name?: string; type?: string; amount?: number; date?: Date }) {
    const payload: any = { ...data };
    if (payload.date && typeof payload.date === 'string') {
      payload.date = new Date(payload.date);
    }
    // @ts-ignore
    return (this.prisma as any).transaction.update({ where: { id }, data: payload });
  }

  async delete(id: number) {
    // @ts-ignore
    return (this.prisma as any).transaction.delete({ where: { id } });
  }
}
