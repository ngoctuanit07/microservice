"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAlertService = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("./mail.service");
const slack_service_1 = require("./slack.service");
const telegram_service_1 = require("./telegram.service");
let ErrorAlertService = class ErrorAlertService {
    constructor(mail, slack, telegram) {
        this.mail = mail;
        this.slack = slack;
        this.telegram = telegram;
        this.logger = new common_1.Logger('ErrorAlert');
    }
    async notifyError(error) {
        this.logger.error(error);
        await this.mail.sendMail('admin@example.com', 'System Error', error);
        await this.slack.sendMessage(`System Error: ${error}`);
        await this.telegram.sendMessage(`System Error: ${error}`);
    }
};
exports.ErrorAlertService = ErrorAlertService;
exports.ErrorAlertService = ErrorAlertService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mail_service_1.MailService,
        slack_service_1.SlackService,
        telegram_service_1.TelegramService])
], ErrorAlertService);
//# sourceMappingURL=error-alert.service.js.map