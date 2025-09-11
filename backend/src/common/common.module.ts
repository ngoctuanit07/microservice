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

@Module({
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
  ],
})
export class CommonModule {}
