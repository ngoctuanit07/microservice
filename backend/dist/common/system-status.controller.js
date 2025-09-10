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
exports.SystemStatusController = void 0;
const common_1 = require("@nestjs/common");
let startTime = Date.now();
let requestCount = 0;
let SystemStatusController = class SystemStatusController {
    getStatus() {
        requestCount++;
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const memory = process.memoryUsage();
        const cpu = process.cpuUsage();
        return {
            uptime,
            memory,
            cpu,
            requestCount,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.SystemStatusController = SystemStatusController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemStatusController.prototype, "getStatus", null);
exports.SystemStatusController = SystemStatusController = __decorate([
    (0, common_1.Controller)('system')
], SystemStatusController);
//# sourceMappingURL=system-status.controller.js.map