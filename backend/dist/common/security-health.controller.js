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
exports.SecurityHealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SecurityHealthController = class SecurityHealthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check() {
        const checks = {};
        checks.jwtSecret = !!process.env.JWT_SECRET;
        checks.hostSecretKey = !!process.env.HOST_SECRET_KEY;
        checks.dbUrl = !!process.env.DATABASE_URL;
        try {
            await this.prisma.$connect();
            checks.db = 'ok';
        }
        catch {
            checks.db = 'fail';
        }
        checks.helmet = !!require.resolve('helmet');
        checks.compression = !!require.resolve('compression');
        checks.cors = !!process.env.CORS_ORIGINS;
        return checks;
    }
};
exports.SecurityHealthController = SecurityHealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityHealthController.prototype, "check", null);
exports.SecurityHealthController = SecurityHealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityHealthController);
//# sourceMappingURL=security-health.controller.js.map