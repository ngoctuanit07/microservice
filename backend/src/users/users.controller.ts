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
  async create(@Body() dto: { email: string; password: string; role?: string }) {
    // ...hash password, create user
    const roleName = dto.role ?? 'user';
    const role = await this.service.findRoleByName(roleName);
    if (!role) throw new Error(`Role ${roleName} not found`);
    return this.service.createUser({
      email: dto.email,
      passwordHash: dto.password, // thực tế nên hash
      roleId: role.id,
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