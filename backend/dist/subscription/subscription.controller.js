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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const subscription_service_1 = require("./subscription.service");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getAvailablePlans() {
        return {
            plans: [
                {
                    type: subscription_service_1.SubscriptionPlanType.FREE,
                    name: 'Free Plan',
                    description: 'Basic plan for individuals',
                    price: 0,
                    features: [
                        'Up to 5 hosts',
                        'Single user',
                        'Basic security',
                        '7-day history',
                    ],
                },
                {
                    type: subscription_service_1.SubscriptionPlanType.BASIC,
                    name: 'Basic Plan',
                    description: 'Perfect for small teams',
                    price: 19.99,
                    features: [
                        'Up to 25 hosts',
                        'Up to 3 users',
                        'Basic security',
                        'API access',
                        '30-day history',
                    ],
                },
                {
                    type: subscription_service_1.SubscriptionPlanType.PRO,
                    name: 'Professional Plan',
                    description: 'For growing businesses',
                    price: 49.99,
                    features: [
                        'Up to 100 hosts',
                        'Up to 10 users',
                        'Advanced security',
                        'API access',
                        'Custom branding',
                        '90-day history',
                        'Automated backups',
                    ],
                },
                {
                    type: subscription_service_1.SubscriptionPlanType.ENTERPRISE,
                    name: 'Enterprise Plan',
                    description: 'For large organizations',
                    price: 149.99,
                    features: [
                        'Unlimited hosts',
                        'Unlimited users',
                        'Advanced security',
                        'API access',
                        'Custom branding',
                        'Unlimited history',
                        'Automated backups',
                        'Dedicated support',
                    ],
                },
            ],
        };
    }
    async getCurrentSubscription(req) {
        return this.subscriptionService.getSubscriptionPlan(req.user.sub);
    }
    async createSubscription(req, body) {
        return this.subscriptionService.createSubscription(req.user.sub, body.planType, body.paymentMethodId);
    }
    async cancelSubscription(req) {
        return this.subscriptionService.cancelSubscription(req.user.sub);
    }
    async checkFeatureAccess(req, feature) {
        return this.subscriptionService.checkFeatureAccess(req.user.sub, feature);
    }
    async checkHostLimit(req) {
        return this.subscriptionService.checkHostLimit(req.user.sub);
    }
    async handleWebhook(payload, req) {
        return this.subscriptionService.handleStripeWebhook(payload);
    }
    async createCheckoutSession(req, planType, successUrl, cancelUrl) {
        return { url: 'https://stripe-checkout-url-would-be-returned-here' };
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getAvailablePlans", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Delete)('cancel'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('feature-access/:feature'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('feature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "checkFeatureAccess", null);
__decorate([
    (0, common_1.Get)('host-limit'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "checkHostLimit", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('checkout-session'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('planType')),
    __param(2, (0, common_1.Query)('successUrl')),
    __param(3, (0, common_1.Query)('cancelUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createCheckoutSession", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map