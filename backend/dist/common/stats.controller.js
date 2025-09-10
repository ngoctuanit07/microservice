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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const simple_cache_service_1 = require("./simple-cache.service");
let StatsController = class StatsController {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async getStats() {
        const cacheKey = 'stats';
        const cached = this.cache.get(cacheKey);
        if (cached)
            return cached;
        const [userCount, hostCount, expiringSoon, topExpiringHosts, topUsers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.host.count(),
            this.prisma.host.count({
                where: {
                    expiredAt: {
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
            this.prisma.host.findMany({
                where: {
                    expiredAt: {
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                },
                orderBy: { expiredAt: 'asc' },
                take: 5,
            }),
            this.prisma.user.findMany({
                take: 5,
                orderBy: {
                    hosts: {
                        _count: 'desc',
                    },
                },
                include: {
                    _count: {
                        select: { hosts: true },
                    },
                },
            }),
        ]);
        const result = {
            userCount,
            hostCount,
            expiringSoon,
            topExpiringHosts,
            topUsers,
        };
        this.cache.set(cacheKey, result, 60 * 1000);
        return result;
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getStats", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)('stats'),
    __param(1, (0, common_1.Inject)(simple_cache_service_1.SimpleCacheService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        simple_cache_service_1.SimpleCacheService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map