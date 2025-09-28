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
exports.BulkOperationsController = void 0;
const common_1 = require("@nestjs/common");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const bulk_operations_service_1 = require("./bulk-operations.service");
let BulkOperationsController = class BulkOperationsController {
    constructor(bulkOperationsService) {
        this.bulkOperationsService = bulkOperationsService;
    }
    async bulkUpdateHosts(bulkUpdateDto, user) {
        return this.bulkOperationsService.bulkUpdateHosts(bulkUpdateDto.hostIds, bulkUpdateDto.updates, user.id);
    }
    async bulkDeleteHosts(bulkDeleteDto, user) {
        return this.bulkOperationsService.bulkDeleteHosts(bulkDeleteDto.ids, user.id);
    }
    async exportHosts(filters, user) {
        return this.bulkOperationsService.exportHosts(filters, user.id);
    }
    async importHosts(importData, user) {
        return this.bulkOperationsService.importHosts(importData.hosts, user.id);
    }
    async getOperationStatus(operationId) {
        return this.bulkOperationsService.getOperationStatus(operationId);
    }
};
exports.BulkOperationsController = BulkOperationsController;
__decorate([
    (0, common_1.Post)('hosts/update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BulkOperationsController.prototype, "bulkUpdateHosts", null);
__decorate([
    (0, common_1.Post)('hosts/delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BulkOperationsController.prototype, "bulkDeleteHosts", null);
__decorate([
    (0, common_1.Post)('hosts/export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BulkOperationsController.prototype, "exportHosts", null);
__decorate([
    (0, common_1.Post)('hosts/import'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BulkOperationsController.prototype, "importHosts", null);
__decorate([
    (0, common_1.Get)('operations/status/:operationId'),
    __param(0, (0, common_1.Query)('operationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BulkOperationsController.prototype, "getOperationStatus", null);
exports.BulkOperationsController = BulkOperationsController = __decorate([
    (0, common_1.Controller)('bulk'),
    __metadata("design:paramtypes", [bulk_operations_service_1.BulkOperationsService])
], BulkOperationsController);
//# sourceMappingURL=bulk-operations.controller.js.map