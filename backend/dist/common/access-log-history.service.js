"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLogHistoryService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const ACCESS_LOG_PATH = 'src/access-history.log';
let AccessLogHistoryService = class AccessLogHistoryService {
    logAccess(entry) {
        fs.appendFileSync(ACCESS_LOG_PATH, entry + '\n', 'utf8');
    }
    getHistory() {
        if (!fs.existsSync(ACCESS_LOG_PATH))
            return [];
        return fs.readFileSync(ACCESS_LOG_PATH, 'utf8');
    }
};
exports.AccessLogHistoryService = AccessLogHistoryService;
exports.AccessLogHistoryService = AccessLogHistoryService = __decorate([
    (0, common_1.Injectable)()
], AccessLogHistoryService);
//# sourceMappingURL=access-log-history.service.js.map