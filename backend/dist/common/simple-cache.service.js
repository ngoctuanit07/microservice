"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SimpleCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCacheService = void 0;
const common_1 = require("@nestjs/common");
let SimpleCacheService = SimpleCacheService_1 = class SimpleCacheService {
    constructor() {
        this.cache = new Map();
        this.logger = new common_1.Logger(SimpleCacheService_1.name);
    }
    set(key, value, ttlMs = 5 * 60 * 1000) {
        this.cache.set(key, { value, expires: Date.now() + ttlMs });
        this.logger.debug(`Cache set: ${key}`);
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        if (entry.expires < Date.now()) {
            this.cache.delete(key);
            this.logger.debug(`Cache expired: ${key}`);
            return undefined;
        }
        this.logger.debug(`Cache hit: ${key}`);
        return entry.value;
    }
    has(key) {
        const entry = this.cache.get(key);
        return !!entry && entry.expires >= Date.now();
    }
    del(key) {
        const result = this.cache.delete(key);
        if (result) {
            this.logger.debug(`Cache deleted: ${key}`);
        }
        return result;
    }
    delByPattern(pattern) {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            this.logger.debug(`Deleted ${count} cache entries matching pattern: ${pattern}`);
        }
        return count;
    }
    clear() {
        const count = this.cache.size;
        this.cache.clear();
        this.logger.debug(`Cache cleared: ${count} entries removed`);
    }
    getStats() {
        const now = Date.now();
        const activeKeys = Array.from(this.cache.entries())
            .filter(([_, entry]) => entry.expires >= now)
            .map(([key]) => key);
        return {
            size: activeKeys.length,
            activeKeys,
        };
    }
};
exports.SimpleCacheService = SimpleCacheService;
exports.SimpleCacheService = SimpleCacheService = SimpleCacheService_1 = __decorate([
    (0, common_1.Injectable)()
], SimpleCacheService);
//# sourceMappingURL=simple-cache.service.js.map