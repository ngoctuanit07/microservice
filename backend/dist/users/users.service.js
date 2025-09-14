"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email }
        });
    }
    async listUsers() {
        return this.prisma.user.findMany();
    }
    async createUser(data) {
        return this.prisma.user.create({
            data
        });
    }
    async updateUser(id, data) {
        const { role, ...updateData } = data;
        return this.prisma.user.update({
            where: { id },
            data: updateData
        });
    }
    async deleteUser(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    async findRoleByName(name) {
        try {
            const roles = await this.prisma.$queryRaw `
        SELECT * FROM Role WHERE name = ${name} LIMIT 1
      `;
            if (!roles || roles.length === 0)
                throw new common_1.NotFoundException(`Role with name ${name} not found`);
            return roles[0];
        }
        catch (error) {
            throw new common_1.NotFoundException(`Role with name ${name} not found`);
        }
    }
    async getRoles() {
        try {
            return await this.prisma.$queryRaw `
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
        }
        catch (error) {
            return [];
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map