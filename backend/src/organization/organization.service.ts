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
    // Kiểm tra user
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Tạo organization mới
    const organization = await this.prisma.organization.create({
      data: {
        name,
        ownerId: userId,
      },
    });

    // Gán user vào organization và set role là ADMIN
    await this.prisma.user.update({
  where: { id: userId },
  data: { organizationId: organization.id, roleId: await this.getRoleId('ADMIN') },
    });

    this.auditLog.log(
      user.email,
      'create',
      undefined,
      `Created organization "${name}"`
    );
    return organization;
  }

  /**
   * Get organization details including users and resource counts
   */
  async getOrganization(id: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        hosts: true,
        users: true,
      },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }

  /**
   * Get user's organization
   */
  async getUserOrganization(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.organizationId) throw new NotFoundException('User does not belong to any organization');
    const organization = await this.prisma.organization.findUnique({ where: { id: user.organizationId } });
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }

  /**
   * Update organization details
   */
  async updateOrganization(id: number, data: { name?: string }, userEmail: string) {
    const organization = await this.prisma.organization.update({
      where: { id },
      data,
    });
    this.auditLog.log(
      userEmail,
      'update',
      undefined,
      `Updated organization ID ${id}: ${JSON.stringify(data)}`
    );
    return organization;
  }

  /**
   * Invite a user to join the organization
   */
  async inviteUser(organizationId: number, email: string, role: string, inviterEmail: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    const roleId = await this.getRoleId(role);
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      user = await this.prisma.user.create({
        data: { email, passwordHash, roleId, organizationId: organizationId },
      });
    } else {
      await this.prisma.user.update({ where: { id: user.id }, data: { organizationId: organizationId, roleId } });
    }
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  await this.prisma.user.update({ where: { id: userId }, data: { organizationId: null, roleId: await this.getRoleId('USER') } });
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
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({ where: { id: userId }, data: { roleId: await this.getRoleId(newRole) } });
    this.auditLog.log(
      adminEmail,
      'update',
      userId,
      `Changed ${user.email}'s role to ${newRole}`
    );
    return { id: userId, email: user.email, role: newRole };
  }

  // Helper to get roleId by name
  private async getRoleId(roleName: string): Promise<number> {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);
    return role.id;
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: number, adminEmail: string) {
    await this.prisma.organization.delete({ where: { id } });
    this.auditLog.log(
      adminEmail,
      'delete',
      undefined,
      `Deleted organization ${id}`
    );
    return { success: true };
  }
}
