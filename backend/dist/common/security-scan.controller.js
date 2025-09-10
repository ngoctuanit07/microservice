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
exports.SecurityScanController = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
let SecurityScanController = class SecurityScanController {
    async auditPackages() {
        return new Promise((resolve) => {
            (0, child_process_1.exec)('npm audit --json', { cwd: process.cwd() }, (err, stdout) => {
                if (err)
                    resolve({ error: err.message });
                else
                    resolve({ audit: JSON.parse(stdout || '{}') });
            });
        });
    }
    async checkEndpoints() {
        const cors = !!process.env.CORS_ORIGINS;
        const helmet = !!require.resolve('helmet');
        const compression = !!require.resolve('compression');
        return { cors, helmet, compression };
    }
};
exports.SecurityScanController = SecurityScanController;
__decorate([
    (0, common_1.Get)('audit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityScanController.prototype, "auditPackages", null);
__decorate([
    (0, common_1.Get)('endpoints'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityScanController.prototype, "checkEndpoints", null);
exports.SecurityScanController = SecurityScanController = __decorate([
    (0, common_1.Controller)('security')
], SecurityScanController);
//# sourceMappingURL=security-scan.controller.js.map