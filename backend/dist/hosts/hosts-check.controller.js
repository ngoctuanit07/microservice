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
exports.HostsCheckController = void 0;
const common_1 = require("@nestjs/common");
const net = require("net");
let HostsCheckController = class HostsCheckController {
    async checkHost(id) {
        const host = { ip: '8.8.8.8', port: 53 };
        return new Promise((resolve) => {
            const socket = new net.Socket();
            let status = 'offline';
            socket.setTimeout(3000);
            socket.on('connect', () => {
                status = 'online';
                socket.destroy();
            });
            socket.on('error', () => {
                status = 'offline';
            });
            socket.on('timeout', () => {
                status = 'offline';
                socket.destroy();
            });
            socket.on('close', () => {
                resolve({ status });
            });
            socket.connect(host.port, host.ip);
        });
    }
};
exports.HostsCheckController = HostsCheckController;
__decorate([
    (0, common_1.Get)(':id/check'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HostsCheckController.prototype, "checkHost", null);
exports.HostsCheckController = HostsCheckController = __decorate([
    (0, common_1.Controller)('hosts')
], HostsCheckController);
//# sourceMappingURL=hosts-check.controller.js.map