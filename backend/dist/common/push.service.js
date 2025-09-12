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
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const web_push_1 = require("web-push");
let PushService = PushService_1 = class PushService {
    constructor() {
        this.logger = new common_1.Logger(PushService_1.name);
        this.pushEnabled = false;
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        const email = process.env.ADMIN_EMAIL || 'admin@example.com';
        if (publicKey && privateKey) {
            try {
                web_push_1.default.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
                this.pushEnabled = true;
                this.logger.log('Push notifications are enabled');
            }
            catch (error) {
                this.logger.error(`Error setting up push notifications: ${error.message || String(error)}`);
            }
        }
        else {
            this.logger.warn('VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY not set. Push notifications will be disabled. ' +
                'To enable push notifications, generate keys with: npx web-push generate-vapid-keys');
        }
    }
    async sendPush(subscription, payload) {
        if (!this.pushEnabled) {
            this.logger.warn('Attempted to send push notification, but push service is not configured');
            return false;
        }
        try {
            await web_push_1.default.sendNotification(subscription, payload);
            return true;
        }
        catch (error) {
            this.logger.error(`Error sending push notification: ${error.message || String(error)}`);
            return false;
        }
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PushService);
//# sourceMappingURL=push.service.js.map