import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  ForbiddenException 
} from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  async create(@Request() req: any, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(
      createTeamDto.name,
      createTeamDto.description,
      createTeamDto.organizationId,
      req.user.userId
    );
  }

  @Get('organization/:organizationId')
  async findByOrganization(@Request() req: any, @Param('organizationId') organizationId: string) {
    return this.teamService.findTeamsByOrganization(+organizationId, req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.teamService.findTeamById(+id, req.user.userId);
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    return this.teamService.updateTeam(+id, updateTeamDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.teamService.deleteTeam(+id, req.user.userId);
  }

  @Post(':id/members')
  async addMember(@Request() req: any, @Param('id') id: string, @Body() dto: { userId: number; role?: string }) {
    return this.teamService.addTeamMember(+id, dto.userId, dto.role || 'MEMBER', req.user.userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Request() req: any, @Param('id') id: string, @Param('userId') userId: string) {
    return this.teamService.removeTeamMember(+id, +userId, req.user.userId);
  }

  @Post(':id/hosts')
  async addHost(@Request() req: any, @Param('id') id: string, @Body() dto: { hostId: number }) {
    return this.teamService.addHostToTeam(+id, dto.hostId, req.user.userId);
  }

  @Delete(':id/hosts/:hostId')
  async removeHost(@Request() req: any, @Param('id') id: string, @Param('hostId') hostId: string) {
    return this.teamService.removeHostFromTeam(+id, +hostId, req.user.userId);
  }
}
