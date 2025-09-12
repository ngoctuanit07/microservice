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
var HostsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostsController = void 0;
const common_1 = require("@nestjs/common");
const hosts_service_1 = require("./hosts.service");
const create_host_dto_1 = require("./dto/create-host.dto");
const update_host_dto_1 = require("./dto/update-host.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let HostsController = HostsController_1 = class HostsController {
    constructor(service) {
        this.service = service;
        this.logger = new common_1.Logger(HostsController_1.name);
    }
    async create(dto, req) {
        const userEmail = req.user?.email;
        this.logger.log(`Creating new host by user: ${userEmail}`);
        return this.service.create(dto, userEmail);
    }
    async list(q) {
        this.logger.debug(`Listing hosts with filters: ${JSON.stringify(q)}`);
        return this.service.findAll(q);
    }
    async get(id) {
        this.logger.debug(`Getting host with ID: ${id}`);
        return this.service.findOne(id);
    }
    async reveal(id, req) {
        const userEmail = req.user?.email;
        this.logger.log(`Password reveal requested for host ${id} by user: ${userEmail}`);
        return this.service.revealPassword(id, userEmail);
    }
    async update(id, dto, req) {
        const userEmail = req.user?.email;
        this.logger.log(`Updating host ${id} by user: ${userEmail}`);
        return this.service.update(id, dto, userEmail);
    }
    async delete(id, req) {
        const userEmail = req.user?.email;
        this.logger.log(`Deleting host ${id} by user: ${userEmail}`);
        return this.service.remove(id, userEmail);
    }
    async batchImport(data, req) {
        const userEmail = req.user?.email;
        this.logger.log(`Batch importing ${data.hosts.length} hosts by user: ${userEmail}`);
        return this.service.batchImport(data.hosts, userEmail);
    }
    async batchUpdate(data, req) {
        const userEmail = req.user?.email;
        this.logger.log(`Batch updating ${data.hosts.length} hosts by user: ${userEmail}`);
        return this.service.batchUpdate(data.hosts, userEmail);
    }
};
exports.HostsController = HostsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, transform: true }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_host_dto_1.CreateHostDto, Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/reveal'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "reveal", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, transform: true }))),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_host_dto_1.UpdateHostDto, Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('batch-import'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "batchImport", null);
__decorate([
    (0, common_1.Post)('batch-update'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'manager'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HostsController.prototype, "batchUpdate", null);
exports.HostsController = HostsController = HostsController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('hosts'),
    __metadata("design:paramtypes", [hosts_service_1.HostsService])
], HostsController);
//# sourceMappingURL=hosts.controller.js.map