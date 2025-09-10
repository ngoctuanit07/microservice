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
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const web_push_1 = require("web-push");
let PushService = class PushService {
    constructor() {
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        if (publicKey && privateKey) {
            web_push_1.default.setVapidDetails('mailto:admin@example.com', publicKey, privateKey);
        }
        else {
            console.warn('VAPID_PUBLIC_KEY hoặc VAPID_PRIVATE_KEY chưa được thiết lập. Push notification sẽ không hoạt động.');
        }
    }
    async sendPush(subscription, payload) {
        await web_push_1.default.sendNotification(subscription, payload);
    }
};
exports.PushService = PushService;
exports.PushService = PushService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PushService);
//# sourceMappingURL=push.service.js.map