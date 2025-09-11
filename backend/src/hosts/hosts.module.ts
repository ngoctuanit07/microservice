import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { HostsExportController } from './hosts-export.controller';
import { CommonModule } from '../common/common.module';
import { HostsCheckController } from './hosts-check.controller';
import { HostsNotifyController } from './hosts-notify.controller';

@Module({
  imports: [CommonModule],
  controllers: [HostsController, HostsExportController, HostsCheckController, HostsNotifyController],
  providers: [HostsService],
})
export class HostsModule {}
