import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { MailService } from './mail.service';
import { TelegramService } from './telegram.service';
import { SlackService } from './slack.service';
import { SimpleCacheService } from './simple-cache.service';
import { ConfigHistoryService } from './config-history.service';
import { BackupService } from './backup.service';
import { PushService } from './push.service';
import { EmailLogService } from './email-log.service';
import { ErrorAlertService } from './error-alert.service';
import { AccessLogHistoryService } from './access-log-history.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController, SearchController],
  providers: [
    AuditLogService,
    MailService,
    TelegramService,
    SlackService,
    SimpleCacheService,
    ConfigHistoryService,
    BackupService,
    PushService,
    EmailLogService,
    ErrorAlertService,
    AccessLogHistoryService,
    DashboardService,
    NotificationGateway,
    NotificationService,
    SearchService,
  ],
  exports: [
    AuditLogService,
    MailService,
    TelegramService,
    SlackService,
    SimpleCacheService,
    ConfigHistoryService,
    BackupService,
    PushService,
    EmailLogService,
    ErrorAlertService,
    AccessLogHistoryService,
    DashboardService,
    NotificationService,
    SearchService,
  ],
})
export class CommonModule {}
