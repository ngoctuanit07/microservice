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
exports.HostsExportController = void 0;
const common_1 = require("@nestjs/common");
const hosts_service_1 = require("./hosts.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let HostsExportController = class HostsExportController {
    constructor(service) {
        this.service = service;
    }
    async exportHosts(q, res) {
        const { items } = await this.service.findAll(q);
        const csv = [
            'id,ip,port,uid,purchasedAt,expiredAt,notes',
            ...items.map((h) => `${h.id},${h.ip},${h.port},${h.uid},${h.purchasedAt.toISOString()},${h.expiredAt.toISOString()},"${h.notes ?? ''}"`)
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=hosts.csv');
        res.send(csv);
    }
};
exports.HostsExportController = HostsExportController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HostsExportController.prototype, "exportHosts", null);
exports.HostsExportController = HostsExportController = __decorate([
    (0, common_1.Controller)('hosts'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService])
], HostsExportController);
//# sourceMappingURL=hosts-export.controller.js.map