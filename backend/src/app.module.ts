import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HostsModule } from './hosts/hosts.module';
import { UsersModule } from './users/users.module';
import { AuditLogService } from './common/audit-log.service';
import { StatsController } from './common/stats.controller';
import { MailService } from './common/mail.service';
import { StatsExportController } from './common/stats-export.controller';
import { SecurityHealthController } from './common/security-health.controller';
import { BackupController } from './common/backup.controller';
import { SystemStatusController } from './common/system-status.controller';
import { ConfigController } from './common/config.controller';
import { SecurityScanController } from './common/security-scan.controller';
import { PushService } from './common/push.service';
import { EmailLogService } from './common/email-log.service';
import { ErrorAlertService } from './common/error-alert.service';
import { AccessLogHistoryService } from './common/access-log-history.service';
import { AccessLogHistoryController } from './common/access-log-history.controller';
import { DependencyController } from './common/dependency.controller';
import { SlackService } from './common/slack.service';
import { ConfigHistoryService } from './common/config-history.service';
import { SimpleCacheService } from './common/simple-cache.service';
import { BackupService } from './common/backup.service';
import { TelegramService } from './common/telegram.service';

@Module({
  imports: [PrismaModule, AuthModule, HostsModule, UsersModule],
  providers: [AuditLogService, MailService, TelegramService, SimpleCacheService, BackupService, SlackService, ConfigHistoryService, PushService, EmailLogService, ErrorAlertService, AccessLogHistoryService],
  controllers: [StatsController, StatsExportController, SecurityHealthController, BackupController, SystemStatusController, ConfigController, DependencyController, SecurityScanController, AccessLogHistoryController],
  exports: [AuditLogService, MailService, TelegramService, SimpleCacheService, BackupService, SlackService, ConfigHistoryService, PushService, EmailLogService, ErrorAlertService, AccessLogHistoryService],
})
export class AppModule {}
