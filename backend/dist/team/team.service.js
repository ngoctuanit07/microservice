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
var TeamService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeamService = TeamService_1 = class TeamService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TeamService_1.name);
    }
    async createTeam(name, description, organizationId, userId) {
        const userOrg = await this.prisma.userTeam.findFirst({
            where: {
                userId
            }
        });
        const isOrgMember = await this.prisma.organization.findFirst({
            where: {
                id: organizationId
            }
        });
        if (!userOrg && !isOrgMember) {
            throw new common_1.ForbiddenException('You do not have permission to create teams in this organization');
        }
        const team = await this.prisma.team.create({
            data: {
                name,
                description,
                organizationId,
                users: {
                    create: {
                        userId,
                        role: 'OWNER'
                    }
                }
            },
            include: {
                users: true
            }
        });
        return team;
    }
    async findTeamsByOrganization(organizationId, userId) {
        const userOrg = await this.prisma.organization.findFirst({
            where: {
                id: organizationId
            }
        });
        if (!userOrg) {
            throw new common_1.ForbiddenException('You do not have permission to access this organization');
        }
        return this.prisma.team.findMany({
            where: {
                organizationId
            },
            include: {
                users: true,
                hosts: true
            }
        });
    }
    async findTeamById(id, userId) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: true
                    }
                },
                hosts: {
                    include: {
                        host: true
                    }
                }
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
        const isMember = team.users.some((membership) => membership.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You do not have permission to access this team');
        }
        return team;
    }
    async updateTeam(id, updateData, userId) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                users: true
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
        const membership = team.users.find((m) => m.userId === userId);
        if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
            throw new common_1.ForbiddenException('You do not have permission to update this team');
        }
        return this.prisma.team.update({
            where: { id },
            data: updateData
        });
    }
    async deleteTeam(id, userId) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                users: true
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
        const isOwner = team.users.some((m) => m.userId === userId && m.role === 'OWNER');
        if (!isOwner) {
            throw new common_1.ForbiddenException('Only the team owner can delete the team');
        }
        return this.prisma.team.delete({
            where: { id }
        });
    }
    async addTeamMember(teamId, memberUserId, role, requestUserId) {
        const team = await this.prisma.team.findUnique({
            where: { id: teamId },
            include: {
                users: true
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${teamId} not found`);
        }
        const membership = team.users.find((m) => m.userId === requestUserId);
        if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
            throw new common_1.ForbiddenException('You do not have permission to add members to this team');
        }
        if (team.users.some((m) => m.userId === memberUserId)) {
            throw new common_1.BadRequestException('User is already a member of this team');
        }
        return this.prisma.userTeam.create({
            data: {
                userId: memberUserId,
                teamId,
                role
            }
        });
    }
    async removeTeamMember(teamId, memberUserId, requestUserId) {
        const team = await this.prisma.team.findUnique({
            where: { id: teamId },
            include: {
                users: true
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${teamId} not found`);
        }
        const requestMembership = team.users.find((m) => m.userId === requestUserId);
        if (!requestMembership || !['ADMIN', 'OWNER'].includes(requestMembership.role)) {
            throw new common_1.ForbiddenException('You do not have permission to remove members from this team');
        }
        const isLastOwner = memberUserId === requestUserId &&
            requestMembership.role === 'OWNER' &&
            team.users.filter((m) => m.role === 'OWNER').length === 1;
        if (isLastOwner) {
            throw new common_1.BadRequestException('Cannot remove the last owner of the team');
        }
        return this.prisma.userTeam.delete({
            where: {
                userId_teamId: {
                    userId: memberUserId,
                    teamId
                }
            }
        });
    }
    async addHostToTeam(teamId, hostId, requestUserId) {
        const team = await this.prisma.team.findUnique({
            where: { id: teamId },
            include: {
                users: true,
                hosts: true
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${teamId} not found`);
        }
        const membership = team.users.find((m) => m.userId === requestUserId);
        if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
            throw new common_1.ForbiddenException('You do not have permission to add hosts to this team');
        }
        if (team.hosts.some((h) => h.hostId === hostId)) {
            throw new common_1.BadRequestException('Host is already in this team');
        }
        return this.prisma.hostTeam.create({
            data: {
                hostId,
                teamId
            }
        });
    }
    async removeHostFromTeam(teamId, hostId, requestUserId) {
        const team = await this.prisma.team.findUnique({
            where: { id: teamId },
            include: {
                users: true
            }
        });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${teamId} not found`);
        }
        const membership = team.users.find((m) => m.userId === requestUserId);
        if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
            throw new common_1.ForbiddenException('You do not have permission to remove hosts from this team');
        }
        return this.prisma.hostTeam.delete({
            where: {
                hostId_teamId: {
                    hostId,
                    teamId
                }
            }
        });
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = TeamService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamService);
//# sourceMappingURL=team.service.js.map