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
exports.AccessLogHistoryController = void 0;
const common_1 = require("@nestjs/common");
const access_log_history_service_1 = require("./access-log-history.service");
let AccessLogHistoryController = class AccessLogHistoryController {
    constructor(history) {
        this.history = history;
    }
    getHistory() {
        return { history: this.history.getHistory() };
    }
};
exports.AccessLogHistoryController = AccessLogHistoryController;
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccessLogHistoryController.prototype, "getHistory", null);
exports.AccessLogHistoryController = AccessLogHistoryController = __decorate([
    (0, common_1.Controller)('access-log'),
    __metadata("design:paramtypes", [access_log_history_service_1.AccessLogHistoryService])
], AccessLogHistoryController);
//# sourceMappingURL=access-log-history.controller.js.map