"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailLogService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const EMAIL_LOG_PATH = 'src/email-history.log';
let EmailLogService = class EmailLogService {
    logEmail(to, subject, text) {
        const entry = `${new Date().toISOString()} | ${to} | ${subject}\n${text}\n---\n`;
        fs.appendFileSync(EMAIL_LOG_PATH, entry, 'utf8');
    }
    getHistory() {
        if (!fs.existsSync(EMAIL_LOG_PATH))
            return [];
        return fs.readFileSync(EMAIL_LOG_PATH, 'utf8');
    }
};
exports.EmailLogService = EmailLogService;
exports.EmailLogService = EmailLogService = __decorate([
    (0, common_1.Injectable)()
], EmailLogService);
//# sourceMappingURL=email-log.service.js.map