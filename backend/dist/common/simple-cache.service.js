"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCacheService = void 0;
const common_1 = require("@nestjs/common");
let SimpleCacheService = class SimpleCacheService {
    constructor() {
        this.cache = new Map();
    }
    set(key, value, ttlMs) {
        this.cache.set(key, { value, expires: Date.now() + ttlMs });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry || entry.expires < Date.now()) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }
};
exports.SimpleCacheService = SimpleCacheService;
exports.SimpleCacheService = SimpleCacheService = __decorate([
    (0, common_1.Injectable)()
], SimpleCacheService);
//# sourceMappingURL=simple-cache.service.js.map