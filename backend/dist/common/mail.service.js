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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const common_2 = require("@nestjs/common");
const email_log_service_1 = require("./email-log.service");
let MailService = class MailService {
    constructor(emailLog) {
        this.emailLog = emailLog;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendMail(to, subject, text) {
        await this.transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
        this.emailLog.logEmail(to, subject, text);
    }
    async sendBulkMail(recipients, subject, text) {
        for (const to of recipients) {
            await this.sendMail(to, subject, text);
        }
        return { sent: recipients.length };
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(email_log_service_1.EmailLogService)),
    __metadata("design:paramtypes", [email_log_service_1.EmailLogService])
], MailService);
//# sourceMappingURL=mail.service.js.map