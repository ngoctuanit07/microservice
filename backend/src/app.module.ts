import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HostsModule } from './hosts/hosts.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { OrganizationModule } from './organization/organization.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TeamModule } from './team/team.module';
import { StatsController } from './common/stats.controller';
import { StatsExportController } from './common/stats-export.controller';
import { SecurityHealthController } from './common/security-health.controller';
import { BackupController } from './common/backup.controller';
import { SystemStatusController } from './common/system-status.controller';
import { ConfigController } from './common/config.controller';
import { SecurityScanController } from './common/security-scan.controller';
import { AccessLogHistoryController } from './common/access-log-history.controller';
import { DependencyController } from './common/dependency.controller';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    PrismaModule, 
    CommonModule, 
    AuthModule, 
    HostsModule, 
    UsersModule, 
    OrganizationModule,
    SubscriptionModule,
  TeamModule,
  TaskModule,
  TransactionModule,
  ],
  controllers: [
    StatsController, 
    StatsExportController, 
    SecurityHealthController, 
    BackupController, 
    SystemStatusController, 
    ConfigController, 
    DependencyController, 
    SecurityScanController, 
    AccessLogHistoryController
  ],
})
export class AppModule {}
