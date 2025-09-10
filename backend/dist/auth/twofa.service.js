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
exports.TwoFAService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const mail_service_1 = require("../common/mail.service");
const OTP_EXPIRY = 5 * 60 * 1000;
let TwoFAService = class TwoFAService {
    constructor(mail) {
        this.mail = mail;
        this.otps = new Map();
    }
    async sendOtp(email) {
        const otp = String((0, crypto_1.randomInt)(100000, 999999));
        const expires = Date.now() + OTP_EXPIRY;
        this.otps.set(email, { otp, expires });
        await this.mail.sendMail(email, 'Your OTP code', `Your OTP: ${otp}`);
        return { message: 'OTP sent' };
    }
    async verifyOtp(email, otp) {
        const entry = this.otps.get(email);
        if (!entry || entry.expires < Date.now() || entry.otp !== otp) {
            throw new Error('Invalid or expired OTP');
        }
        this.otps.delete(email);
        return { message: 'OTP verified' };
    }
};
exports.TwoFAService = TwoFAService;
exports.TwoFAService = TwoFAService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], TwoFAService);
//# sourceMappingURL=twofa.service.js.map