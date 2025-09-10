import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  list() {
    return this.service.listUsers();
  }

  @Post()
  create(@Body() dto: { email: string; password: string; role?: string }) {
    // ...hash password, create user
    return this.service.createUser({
      email: dto.email,
      passwordHash: dto.password, // thực tế nên hash
      role: dto.role ?? 'user',
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { email?: string; password?: string; role?: string }) {
    const data: any = { ...dto };
    if (dto.password) data.passwordHash = dto.password; // thực tế nên hash
    delete data.password;
    return this.service.updateUser(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteUser(Number(id));
  }
}