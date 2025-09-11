"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("./audit-log.service");
const mail_service_1 = require("./mail.service");
const telegram_service_1 = require("./telegram.service");
const slack_service_1 = require("./slack.service");
const simple_cache_service_1 = require("./simple-cache.service");
const config_history_service_1 = require("./config-history.service");
const backup_service_1 = require("./backup.service");
const push_service_1 = require("./push.service");
const email_log_service_1 = require("./email-log.service");
const error_alert_service_1 = require("./error-alert.service");
const access_log_history_service_1 = require("./access-log-history.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        providers: [
            audit_log_service_1.AuditLogService,
            mail_service_1.MailService,
            telegram_service_1.TelegramService,
            slack_service_1.SlackService,
            simple_cache_service_1.SimpleCacheService,
            config_history_service_1.ConfigHistoryService,
            backup_service_1.BackupService,
            push_service_1.PushService,
            email_log_service_1.EmailLogService,
            error_alert_service_1.ErrorAlertService,
            access_log_history_service_1.AccessLogHistoryService,
        ],
        exports: [
            audit_log_service_1.AuditLogService,
            mail_service_1.MailService,
            telegram_service_1.TelegramService,
            slack_service_1.SlackService,
            simple_cache_service_1.SimpleCacheService,
            config_history_service_1.ConfigHistoryService,
            backup_service_1.BackupService,
            push_service_1.PushService,
            email_log_service_1.EmailLogService,
            error_alert_service_1.ErrorAlertService,
            access_log_history_service_1.AccessLogHistoryService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map