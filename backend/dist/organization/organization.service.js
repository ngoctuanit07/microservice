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
var OrganizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/audit-log.service");
let OrganizationService = OrganizationService_1 = class OrganizationService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
        this.logger = new common_1.Logger(OrganizationService_1.name);
    }
    async createOrganization(name, userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const organization = await this.prisma.organization.create({
            data: {
                name,
                ownerId: userId,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { organizationId: organization.id, roleId: await this.getRoleId('ADMIN') },
        });
        this.auditLog.log(user.email, 'create', undefined, `Created organization "${name}"`);
        return organization;
    }
    async getOrganization(id) {
        const organization = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                hosts: true,
                users: true,
            },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found');
        return organization;
    }
    async getUserOrganization(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.organizationId)
            throw new common_1.NotFoundException('User does not belong to any organization');
        const organization = await this.prisma.organization.findUnique({ where: { id: user.organizationId } });
        if (!organization)
            throw new common_1.NotFoundException('Organization not found');
        return organization;
    }
    async updateOrganization(id, data, userEmail) {
        const organization = await this.prisma.organization.update({
            where: { id },
            data,
        });
        this.auditLog.log(userEmail, 'update', undefined, `Updated organization ID ${id}: ${JSON.stringify(data)}`);
        return organization;
    }
    async inviteUser(organizationId, email, role, inviterEmail) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        const roleId = await this.getRoleId(role);
        if (!user) {
            const tempPassword = Math.random().toString(36).slice(-8);
            const bcrypt = require('bcryptjs');
            const passwordHash = await bcrypt.hash(tempPassword, 10);
            user = await this.prisma.user.create({
                data: { email, passwordHash, roleId, organizationId: organizationId },
            });
        }
        else {
            await this.prisma.user.update({ where: { id: user.id }, data: { organizationId: organizationId, roleId } });
        }
        this.auditLog.log(inviterEmail, 'invite', user.id, `Invited ${email} to organization with role ${role}`);
        return user;
    }
    async removeUser(organizationId, userId, removerEmail) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({ where: { id: userId }, data: { organizationId: null, roleId: await this.getRoleId('USER') } });
        this.auditLog.log(removerEmail, 'remove', userId, `Removed ${user.email} from organization ${organizationId}`);
        return { success: true };
    }
    async changeUserRole(organizationId, userId, newRole, adminEmail) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({ where: { id: userId }, data: { roleId: await this.getRoleId(newRole) } });
        this.auditLog.log(adminEmail, 'update', userId, `Changed ${user.email}'s role to ${newRole}`);
        return { id: userId, email: user.email, role: newRole };
    }
    async getRoleId(roleName) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role)
            throw new Error(`Role ${roleName} not found`);
        return role.id;
    }
    async deleteOrganization(id, adminEmail) {
        await this.prisma.organization.delete({ where: { id } });
        this.auditLog.log(adminEmail, 'delete', undefined, `Deleted organization ${id}`);
        return { success: true };
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = OrganizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map