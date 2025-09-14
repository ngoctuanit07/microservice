import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('boards')
  getBoards() {
    return this.taskService.getBoards();
  }

  @Post('boards')
  createBoard(@Body('name') name: string) {
    return this.taskService.createBoard(name);
  }

  @Get('boards/:boardId/tasks')
  getTasks(@Param('boardId') boardId: number) {
    return this.taskService.getTasks(Number(boardId));
  }

  @Post('boards/:boardId/tasks')
  createTask(@Param('boardId') boardId: number, @Body() body: any) {
    return this.taskService.createTask(Number(boardId), body.title, body.description);
  }

  @Put('tasks/:id')
  updateTask(@Param('id') id: number, @Body() body: any) {
    return this.taskService.updateTask(Number(id), body);
  }

  @Put('tasks/:id/move')
  moveTask(@Param('id') id: number, @Body() body: any) {
    return this.taskService.moveTask(Number(id), body.boardId, body.status);
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: number) {
    return this.taskService.deleteTask(Number(id));
  }
}
