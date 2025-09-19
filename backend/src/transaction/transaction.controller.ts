import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @Post()
  async create(@Body() body: { name: string; type: string; amount: number; date: Date }) {
    try {
      return await this.service.create(body);
    } catch (err) {
      // Log underlying error and rethrow so GlobalExceptionFilter will report it
      console.error('Transaction create error:', err);
      throw err;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; type?: string; amount?: number; date?: Date }) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
}
