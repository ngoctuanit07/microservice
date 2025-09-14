import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async createOrganization(@Body() body: { name: string }, @Req() req: any) {
    return this.organizationService.createOrganization(body.name, req.user.sub);
  }

  @Get('current')
  async getCurrentOrganization(@Req() req: any) {
    return this.organizationService.getUserOrganization(req.user.sub);
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async getOrganization(@Param('id') id: string) {
    return this.organizationService.getOrganization(+id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async updateOrganization(
    @Param('id') id: string, 
    @Body() body: { name?: string },
    @Req() req: any
  ) {
    return this.organizationService.updateOrganization(+id, body, req.user.email);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(200)
  async deleteOrganization(@Param('id') id: string, @Req() req: any) {
    return this.organizationService.deleteOrganization(+id, req.user.email);
  }

  @Post(':id/users')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async inviteUser(
    @Param('id') id: string,
    @Body() body: { email: string; role?: string },
    @Req() req: any
  ) {
    const role = body.role || 'USER';
    return this.organizationService.inviteUser(+id, body.email, role, req.user.email);
  }

  @Delete(':orgId/users/:userId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(200)
  async removeUser(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Req() req: any
  ) {
    return this.organizationService.removeUser(+orgId, +userId, req.user.email);
  }

  @Patch(':orgId/users/:userId/role')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async changeUserRole(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() body: { role: string },
    @Req() req: any
  ) {
    return this.organizationService.changeUserRole(+orgId, +userId, body.role, req.user.email);
  }
}
