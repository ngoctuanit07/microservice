import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  listUsers() {
    return this.prisma.user.findMany();
  }

  createUser(data: { email: string; passwordHash: string; role?: string }) {
    return this.prisma.user.create({ data });
  }

  updateUser(id: number, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
