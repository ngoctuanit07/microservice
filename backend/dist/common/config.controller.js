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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const config_history_service_1 = require("./config-history.service");
let ConfigController = class ConfigController {
    constructor(history) {
        this.history = history;
    }
    getConfig() {
        const envPath = 'src/.env';
        if (!fs.existsSync(envPath))
            return { error: '.env not found' };
        const env = fs.readFileSync(envPath, 'utf8');
        return { env };
    }
    getHistory() {
        return { history: this.history.getHistory() };
    }
    updateConfig(body, req) {
        const envPath = 'src/.env';
        fs.writeFileSync(envPath, body.env, 'utf8');
        const user = req.user?.email || 'system';
        this.history.logChange(user, body.env);
        return { success: true };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateConfig", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    __param(0, (0, common_1.Inject)(config_history_service_1.ConfigHistoryService)),
    __metadata("design:paramtypes", [config_history_service_1.ConfigHistoryService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map