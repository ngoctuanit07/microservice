import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @Post()
  async create(@Body() body: CreateTransactionDto) {
    try {
      return await this.service.create(body);
    } catch (err) {
      // Log underlying error and rethrow so GlobalExceptionFilter will report it
      console.error('Transaction create error:', err);
      throw err;
    }
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTransactionDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
