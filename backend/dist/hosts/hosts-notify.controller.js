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
exports.HostsNotifyController = void 0;
const common_1 = require("@nestjs/common");
const hosts_service_1 = require("./hosts.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let HostsNotifyController = class HostsNotifyController {
    constructor(service) {
        this.service = service;
    }
    async notifyExpiring() {
        return this.service.notifyExpiringHosts();
    }
};
exports.HostsNotifyController = HostsNotifyController;
__decorate([
    (0, common_1.Post)('notify-expiring'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HostsNotifyController.prototype, "notifyExpiring", null);
exports.HostsNotifyController = HostsNotifyController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('hosts'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService])
], HostsNotifyController);
//# sourceMappingURL=hosts-notify.controller.js.map