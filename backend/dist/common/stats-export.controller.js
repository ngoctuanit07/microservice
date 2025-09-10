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
exports.StatsExportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const XLSX = require("xlsx");
let StatsExportController = class StatsExportController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportStats(res) {
        const userCount = await this.prisma.user.count();
        const hostCount = await this.prisma.host.count();
        const expiringSoon = await this.prisma.host.count({
            where: {
                expiredAt: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            },
        });
        const data = [
            { key: 'userCount', value: userCount },
            { key: 'hostCount', value: hostCount },
            { key: 'expiringSoon', value: expiringSoon },
        ];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stats');
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=stats.xlsx');
        res.send(buffer);
    }
};
exports.StatsExportController = StatsExportController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsExportController.prototype, "exportStats", null);
exports.StatsExportController = StatsExportController = __decorate([
    (0, common_1.Controller)('stats'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsExportController);
//# sourceMappingURL=stats-export.controller.js.map