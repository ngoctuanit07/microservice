import { Controller, Post, UseGuards } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('hosts')
export class HostsNotifyController {
  constructor(private readonly service: HostsService) {}

  @Post('notify-expiring')
  async notifyExpiring() {
    return this.service.notifyExpiringHosts();
  }
}
