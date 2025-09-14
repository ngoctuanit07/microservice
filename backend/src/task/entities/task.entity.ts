import { Prisma } from '@prisma/client';

export class Task {
  id!: number;
  title!: string;
  description?: string;
  status!: string;
  boardId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
