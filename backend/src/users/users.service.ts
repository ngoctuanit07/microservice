import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async listUsers() {
    return this.prisma.user.findMany();
  }

  async createUser(data: { email: string; passwordHash: string; roleId: number }) {
    return this.prisma.user.create({
      data
    });
  }

  async updateUser(id: number, data: any) {
    // If role is passed as a string, remove it to prevent errors
    const { role, ...updateData } = data;
    return this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
  
  // Role methods - these will be implemented in a separate RolesService
  // These are stubs for backwards compatibility
  async findRoleByName(name: string) {
    try {
      const roles: any[] = await this.prisma.$queryRaw`
        SELECT * FROM Role WHERE name = ${name} LIMIT 1
      `;
      if (!roles || roles.length === 0) throw new NotFoundException(`Role with name ${name} not found`);
      return roles[0];
    } catch (error) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
  }
  
  async getRoles() {
    try {
      return await this.prisma.$queryRaw`
        SELECT r.*, 
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', rp.id,
              'permissionId', rp.permissionId,
              'permission', (SELECT JSON_OBJECT('id', p.id, 'name', p.name) FROM Permission p WHERE p.id = rp.permissionId)
            )
          ) FROM RolePermission rp WHERE rp.roleId = r.id) as permissions
        FROM Role r
      `;
    } catch (error) {
      return [];
    }
  }
}
