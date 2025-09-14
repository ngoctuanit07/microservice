import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new team within an organization
   */
  async createTeam(name: string, description: string | undefined, organizationId: number, userId: number) {
    // Verify user has access to the organization
    const userOrg = await this.prisma.userTeam.findFirst({
      where: {
        userId,
        team: {
          organizationId
        }
      }
    });

    const isOrgMember = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        users: {
          some: {
            userId
          }
        }
      }
    });

    if (!userOrg && !isOrgMember) {
      throw new ForbiddenException('You do not have permission to create teams in this organization');
    }

    // Create the team
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

  /**
   * Find all teams for an organization
   */
  async findTeamsByOrganization(organizationId: number, userId: number) {
    // Verify user has access to the organization
    const userOrg = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        users: {
          some: {
            userId
          }
        }
      }
    });

    if (!userOrg) {
      throw new ForbiddenException('You do not have permission to access this organization');
    }

    // Get teams
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

  /**
   * Find a team by ID
   */
  async findTeamById(id: number, userId: number) {
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
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check if user is a member of the team or organization
    const isMember = team.users.some(membership => membership.userId === userId);
    
    if (!isMember) {
      throw new ForbiddenException('You do not have permission to access this team');
    }

    return team;
  }

  /**
   * Update a team
   */
  async updateTeam(
    id: number, 
    updateData: { name?: string; description?: string }, 
    userId: number
  ) {
    // Check if team exists and user has permission
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check if user is an admin or owner of the team
    const membership = team.users.find(m => m.userId === userId);
    if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
      throw new ForbiddenException('You do not have permission to update this team');
    }

    return this.prisma.team.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Delete a team
   */
  async deleteTeam(id: number, userId: number) {
    // Check if team exists and user has permission
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        users: true
      }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check if user is the owner of the team
    const isOwner = team.users.some(m => m.userId === userId && m.role === 'OWNER');
    if (!isOwner) {
      throw new ForbiddenException('Only the team owner can delete the team');
    }

    return this.prisma.team.delete({
      where: { id }
    });
  }

  /**
   * Add a member to a team
   */
  async addTeamMember(teamId: number, memberUserId: number, role: string, requestUserId: number) {
    // Check if team exists and user has permission
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: true
      }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if requesting user is an admin or owner of the team
    const membership = team.users.find(m => m.userId === requestUserId);
    if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
      throw new ForbiddenException('You do not have permission to add members to this team');
    }

    // Check if user is already a member
    if (team.users.some(m => m.userId === memberUserId)) {
      throw new BadRequestException('User is already a member of this team');
    }

    // Add the user to the team
    return this.prisma.userTeam.create({
      data: {
        userId: memberUserId,
        teamId,
        role
      }
    });
  }

  /**
   * Remove a member from a team
   */
  async removeTeamMember(teamId: number, memberUserId: number, requestUserId: number) {
    // Check if team exists and user has permission
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: true
      }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if requesting user is an admin or owner of the team
    const requestMembership = team.users.find(m => m.userId === requestUserId);
    if (!requestMembership || !['ADMIN', 'OWNER'].includes(requestMembership.role)) {
      throw new ForbiddenException('You do not have permission to remove members from this team');
    }

    // Check that we're not trying to remove the last owner
    const isLastOwner = 
      memberUserId === requestUserId && 
      requestMembership.role === 'OWNER' && 
      team.users.filter(m => m.role === 'OWNER').length === 1;

    if (isLastOwner) {
      throw new BadRequestException('Cannot remove the last owner of the team');
    }

    // Remove the user from the team
    return this.prisma.userTeam.delete({
      where: {
        userId_teamId: {
          userId: memberUserId,
          teamId
        }
      }
    });
  }

  /**
   * Add a host to a team
   */
  async addHostToTeam(teamId: number, hostId: number, requestUserId: number) {
    // Check if team exists and user has permission
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: true,
        hosts: true
      }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if requesting user is an admin or owner of the team
    const membership = team.users.find(m => m.userId === requestUserId);
    if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
      throw new ForbiddenException('You do not have permission to add hosts to this team');
    }

    // Check if host is already in the team
    if (team.hosts.some(h => h.hostId === hostId)) {
      throw new BadRequestException('Host is already in this team');
    }

    // Add the host to the team
    return this.prisma.hostTeam.create({
      data: {
        hostId,
        teamId
      }
    });
  }

  /**
   * Remove a host from a team
   */
  async removeHostFromTeam(teamId: number, hostId: number, requestUserId: number) {
    // Check if team exists and user has permission
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: true
      }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check if requesting user is an admin or owner of the team
    const membership = team.users.find(m => m.userId === requestUserId);
    if (!membership || !['ADMIN', 'OWNER'].includes(membership.role)) {
      throw new ForbiddenException('You do not have permission to remove hosts from this team');
    }

    // Remove the host from the team
    return this.prisma.hostTeam.delete({
      where: {
        hostId_teamId: {
          hostId,
          teamId
        }
      }
    });
  }
}
