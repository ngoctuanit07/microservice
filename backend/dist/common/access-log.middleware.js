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
exports.AccessLogMiddleware = void 0;
const common_1 = require("@nestjs/common");
const access_log_history_service_1 = require("./access-log-history.service");
let AccessLogMiddleware = class AccessLogMiddleware {
    constructor(history) {
        this.history = history;
        this.logger = new common_1.Logger('AccessLog');
    }
    use(req, res, next) {
        const { method, url } = req;
        const user = req.user?.email || 'anonymous';
        const that = this;
        res.on('finish', function () {
            const logEntry = `${new Date().toISOString()} | ${method} ${url} by ${user} - ${res.statusCode}`;
            that.logger.log(logEntry);
            that.history.logAccess(logEntry);
        });
        next();
    }
};
exports.AccessLogMiddleware = AccessLogMiddleware;
exports.AccessLogMiddleware = AccessLogMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(access_log_history_service_1.AccessLogHistoryService)),
    __metadata("design:paramtypes", [access_log_history_service_1.AccessLogHistoryService])
], AccessLogMiddleware);
//# sourceMappingURL=access-log.middleware.js.map