"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const hosts_module_1 = require("./hosts/hosts.module");
const users_module_1 = require("./users/users.module");
const audit_log_service_1 = require("./common/audit-log.service");
const stats_controller_1 = require("./common/stats.controller");
const mail_service_1 = require("./common/mail.service");
const stats_export_controller_1 = require("./common/stats-export.controller");
const security_health_controller_1 = require("./common/security-health.controller");
const backup_controller_1 = require("./common/backup.controller");
const system_status_controller_1 = require("./common/system-status.controller");
const config_controller_1 = require("./common/config.controller");
const security_scan_controller_1 = require("./common/security-scan.controller");
const push_service_1 = require("./common/push.service");
const email_log_service_1 = require("./common/email-log.service");
const error_alert_service_1 = require("./common/error-alert.service");
const access_log_history_service_1 = require("./common/access-log-history.service");
const access_log_history_controller_1 = require("./common/access-log-history.controller");
const dependency_controller_1 = require("./common/dependency.controller");
const slack_service_1 = require("./common/slack.service");
const config_history_service_1 = require("./common/config-history.service");
const simple_cache_service_1 = require("./common/simple-cache.service");
const backup_service_1 = require("./common/backup.service");
const telegram_service_1 = require("./common/telegram.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule, hosts_module_1.HostsModule, users_module_1.UsersModule],
        providers: [audit_log_service_1.AuditLogService, mail_service_1.MailService, telegram_service_1.TelegramService, simple_cache_service_1.SimpleCacheService, backup_service_1.BackupService, slack_service_1.SlackService, config_history_service_1.ConfigHistoryService, push_service_1.PushService, email_log_service_1.EmailLogService, error_alert_service_1.ErrorAlertService, access_log_history_service_1.AccessLogHistoryService],
        controllers: [stats_controller_1.StatsController, stats_export_controller_1.StatsExportController, security_health_controller_1.SecurityHealthController, backup_controller_1.BackupController, system_status_controller_1.SystemStatusController, config_controller_1.ConfigController, dependency_controller_1.DependencyController, security_scan_controller_1.SecurityScanController, access_log_history_controller_1.AccessLogHistoryController],
        exports: [audit_log_service_1.AuditLogService, mail_service_1.MailService, telegram_service_1.TelegramService, simple_cache_service_1.SimpleCacheService, backup_service_1.BackupService, slack_service_1.SlackService, config_history_service_1.ConfigHistoryService, push_service_1.PushService, email_log_service_1.EmailLogService, error_alert_service_1.ErrorAlertService, access_log_history_service_1.AccessLogHistoryService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map