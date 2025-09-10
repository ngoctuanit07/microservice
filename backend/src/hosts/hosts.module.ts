import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { HostsExportController } from './hosts-export.controller';

import { HostsCheckController } from './hosts-check.controller';
import { HostsNotifyController } from './hosts-notify.controller';

@Module({
  controllers: [HostsController, HostsExportController, HostsCheckController, HostsNotifyController],
  providers: [HostsService],
})
export class HostsModule {}
