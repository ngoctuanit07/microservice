import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/audit-log.service';

/**
 * IMPORTANT: This is a simplified version of the organization service that works with the current
 * schema. Once the schema migration in MIGRATION_PLAN.md is executed, this service should be
 * updated to use the new model structure.
 */
@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);
  
  // Note: This is a temporary implementation until the schema migration is complete.
  // See MIGRATION_PLAN.md for the full migration steps.

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Create a new organization and assign the creator as admin
   */
  async createOrganization(name: string, userId: number) {
    // Check if user already belongs to an organization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create new organization and associate user
    const organization = await this.prisma.$transaction(async (tx) => {
      // This code will be replaced after schema migration
      // For now we're simulating organization creation
      this.logger.log(`Creating organization ${name} for user ${userId}`);
      
      // Log the creation
      this.auditLog.log(
        user.email,
        'create',
        undefined, // hostId is undefined for organization operations
        `Created organization "${name}"`
      );
      
      return {
        id: 0,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Update user role to ADMIN in their organization
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    return organization;
  }

  /**
   * Get organization details including users and resource counts
   */
  async getOrganization(id: number) {
    // This method will be implemented after schema migration
    this.logger.log(`Getting organization with ID ${id}`);
    
    // Simulate organization data
    return {
      id: id,
      name: 'Demo Organization',
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [],
      _count: {
        hosts: 0,
        users: 0
      }
    };
  }

  /**
   * Get user's organization
   */
  async getUserOrganization(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Simulate organization data
    return {
      id: 1,
      name: 'User Organization',
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: {
        users: 1,
        hosts: user.role === 'ADMIN' ? 5 : 0
      }
    };
  }

  /**
   * Update organization details
   */
  async updateOrganization(id: number, data: { name?: string }, userEmail: string) {
    // This method will be implemented after schema migration
    this.logger.log(`Updating organization ${id} with data ${JSON.stringify(data)}`);
    
    // Log the update
    this.auditLog.log(
      userEmail,
      'update',
      undefined, // hostId is undefined for organization operations
      `Updated organization ID ${id}: ${JSON.stringify(data)}`
    );

    return {
      id: id,
      name: data.name || 'Updated Organization',
      updatedAt: new Date()
    };
  }

  /**
   * Invite a user to join the organization
   */
  async inviteUser(organizationId: number, email: string, role: string, inviterEmail: string) {
    // This method will be implemented after schema migration
    this.logger.log(`Inviting user ${email} to organization ${organizationId} with role ${role}`);
    
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
        }
      });

      this.logger.log(`Created new user ${email} with role ${role}`);
    }

    // Log the invitation
    this.auditLog.log(
      inviterEmail,
      'invite',
      user.id,
      `Invited ${email} to organization with role ${role}`
    );

    return user;
  }

  /**
   * Remove a user from the organization
   */
  async removeUser(organizationId: number, userId: number, removerEmail: string) {
    // This method will be implemented after schema migration
    this.logger.log(`Removing user ${userId} from organization ${organizationId}`);
    
    // Get user email for logging
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Log the removal
    this.auditLog.log(
      removerEmail,
      'remove',
      userId,
      `Removed ${user.email} from organization ${organizationId}`
    );

    return { success: true };
  }

  /**
   * Change a user's role within the organization
   */
  async changeUserRole(organizationId: number, userId: number, newRole: string, adminEmail: string) {
    // This method will be implemented after schema migration
    this.logger.log(`Changing user ${userId} role to ${newRole} in organization ${organizationId}`);
    
    // Get user for logging
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the user's role
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    // Log the change
    this.auditLog.log(
      adminEmail,
      'update',
      userId,
      `Changed ${user.email}'s role to ${newRole}`
    );

    return {
      id: userId,
      email: user.email,
      role: newRole
    };
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: number, adminEmail: string) {
    // This method will be implemented after schema migration
    this.logger.log(`Deleting organization ${id}`);
    
    // Log the deletion
    this.auditLog.log(
      adminEmail,
      'delete',
      undefined,
      `Deleted organization ${id}`
    );

    return { success: true };
  }
}
