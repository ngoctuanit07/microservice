import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getBoards() {
    return this.prisma.board.findMany({ include: { tasks: true } });
  }

  async createBoard(name: string) {
    return this.prisma.board.create({ data: { name } });
  }

  async getTasks(boardId: number) {
    return this.prisma.task.findMany({ where: { boardId } });
  }

  async createTask(boardId: number, title: string, description?: string) {
    return this.prisma.task.create({ data: { boardId, title, description, status: 'todo' } });
  }

  async updateTask(id: number, data: any) {
    return this.prisma.task.update({ where: { id }, data });
  }

  async moveTask(id: number, boardId: number, status: string) {
    return this.prisma.task.update({ where: { id }, data: { boardId, status } });
  }

  async deleteTask(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
