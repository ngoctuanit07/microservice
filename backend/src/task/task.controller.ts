import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  @Put('boards/:id')
  updateBoard(@Param('id') id: number, @Body() body: any) {
    return this.taskService.updateBoard(Number(id), body.name);
  }

  @Delete('boards/:id')
  deleteBoard(@Param('id') id: number) {
    return this.taskService.deleteBoard(Number(id));
  }
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
    // Only allow updating title, description, status
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    return this.taskService.updateTask(Number(id), updateData);
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
