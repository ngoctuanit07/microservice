"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigHistoryService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const LOG_PATH = 'src/config-history.log';
let ConfigHistoryService = class ConfigHistoryService {
    logChange(user, newEnv) {
        const entry = `${new Date().toISOString()} | ${user}\n${newEnv}\n---\n`;
        fs.appendFileSync(LOG_PATH, entry, 'utf8');
    }
    getHistory() {
        if (!fs.existsSync(LOG_PATH))
            return [];
        return fs.readFileSync(LOG_PATH, 'utf8');
    }
};
exports.ConfigHistoryService = ConfigHistoryService;
exports.ConfigHistoryService = ConfigHistoryService = __decorate([
    (0, common_1.Injectable)()
], ConfigHistoryService);
//# sourceMappingURL=config-history.service.js.map