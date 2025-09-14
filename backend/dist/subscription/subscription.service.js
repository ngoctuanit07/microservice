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
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.PLAN_FEATURES = exports.SubscriptionPlanType = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("./stripe.service");
const mail_service_1 = require("../common/mail.service");
var SubscriptionPlanType;
(function (SubscriptionPlanType) {
    SubscriptionPlanType["FREE"] = "FREE";
    SubscriptionPlanType["BASIC"] = "BASIC";
    SubscriptionPlanType["PRO"] = "PRO";
    SubscriptionPlanType["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionPlanType || (exports.SubscriptionPlanType = SubscriptionPlanType = {}));
exports.PLAN_FEATURES = {
    [SubscriptionPlanType.FREE]: {
        maxHosts: 5,
        maxUsers: 1,
        advancedSecurity: false,
        apiAccess: false,
        dedicatedSupport: false,
        customBranding: false,
        automatedBackups: false,
    },
    [SubscriptionPlanType.BASIC]: {
        maxHosts: 25,
        maxUsers: 3,
        advancedSecurity: false,
        apiAccess: true,
        dedicatedSupport: false,
        customBranding: false,
        automatedBackups: false,
    },
    [SubscriptionPlanType.PRO]: {
        maxHosts: 100,
        maxUsers: 10,
        advancedSecurity: true,
        apiAccess: true,
        dedicatedSupport: false,
        customBranding: true,
        automatedBackups: true,
    },
    [SubscriptionPlanType.ENTERPRISE]: {
        maxHosts: -1,
        maxUsers: -1,
        advancedSecurity: true,
        apiAccess: true,
        dedicatedSupport: true,
        customBranding: true,
        automatedBackups: true,
    },
};
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    constructor(prisma, stripeService, mailService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(SubscriptionService_1.name);
    }
    async createCheckoutSession(userId, planId, successUrl, cancelUrl) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user || !user.organization) {
            throw new common_1.BadRequestException('User or organization not found');
        }
        return { url: successUrl || 'https://example.com/subscription/success' };
    }
    async getSubscriptionPlan(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.organization) {
            return {
                plan: SubscriptionPlanType.FREE,
                features: exports.PLAN_FEATURES[SubscriptionPlanType.FREE],
                expiresAt: null,
            };
        }
        return {
            plan: user.organization.subscriptionPlan,
            features: exports.PLAN_FEATURES[user.organization.subscriptionPlan],
            expiresAt: user.organization.subscriptionExpiresAt,
            stripeCustomerId: user.organization.stripeCustomerId,
        };
    }
    async checkFeatureAccess(userId, feature) {
        const { features } = await this.getSubscriptionPlan(userId);
        return !!features[feature];
    }
    async checkHostLimit(userId) {
        const { features } = await this.getSubscriptionPlan(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user || !user.organization) {
            throw new common_1.NotFoundException('User or organization not found');
        }
        const currentHostCount = await this.prisma.host.count({
            where: {
                user: {
                    organizationId: user.organizationId,
                },
            },
        });
        return {
            allowed: features.maxHosts === -1 || currentHostCount < features.maxHosts,
            current: currentHostCount,
            limit: features.maxHosts,
        };
    }
    async createSubscription(userId, planType, paymentMethodId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.organization) {
            throw new common_1.BadRequestException('User must be part of an organization');
        }
        let stripeCustomerId = user.organization.stripeCustomerId ?? undefined;
        if (!stripeCustomerId) {
            const customer = await this.stripeService.createCustomer({
                email: user.email,
                name: user.name ?? user.email,
                paymentMethodId,
            });
            stripeCustomerId = customer.id;
        }
        else {
            await this.stripeService.updateDefaultPaymentMethod(stripeCustomerId, paymentMethodId);
        }
        const subscription = await this.stripeService.createSubscription(stripeCustomerId, planType);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.organization.update({
            where: { id: user.organizationId ?? undefined },
            data: {
                subscriptionPlan: planType,
                subscriptionId: subscription.id ?? undefined,
                stripeCustomerId: stripeCustomerId,
                subscriptionExpiresAt: expiresAt,
            },
        });
        await this.mailService.sendMail(user.email, `Subscription Confirmed: ${planType} Plan`, `Thank you for subscribing to the ${planType} plan. Your subscription is now active.`);
        return {
            success: true,
            plan: planType,
            features: exports.PLAN_FEATURES[planType],
            expiresAt,
            subscriptionId: subscription.id ?? undefined,
        };
    }
    async cancelSubscription(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user || !user.organization) {
            throw new common_1.NotFoundException('User or organization not found');
        }
        const { subscriptionId } = user.organization;
        if (!subscriptionId) {
            throw new common_1.BadRequestException('No active subscription to cancel');
        }
        await this.stripeService.cancelSubscription(subscriptionId);
        await this.prisma.organization.update({
            where: { id: user.organizationId ?? undefined },
            data: {
                subscriptionPlan: SubscriptionPlanType.FREE,
                subscriptionId: undefined,
            },
        });
        await this.mailService.sendMail(user.email, 'Subscription Canceled', 'Your subscription has been canceled. You can resubscribe at any time from your account settings.');
        return {
            success: true,
            message: 'Subscription successfully canceled',
        };
    }
    async handleStripeWebhook(event) {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await this.handleSuccessfulPayment(event);
                break;
            case 'invoice.payment_failed':
                await this.handleFailedPayment(event);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionCanceled(event);
                break;
        }
    }
    async handleSuccessfulPayment(event) {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const organization = await this.prisma.organization.findFirst({
            where: { subscriptionId },
        });
        if (!organization)
            return;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.organization.update({
            where: { id: organization.id },
            data: { subscriptionExpiresAt: expiresAt },
        });
        const adminUsers = await this.prisma.user.findMany({
            where: { organizationId: organization.id, role: 'ADMIN' },
        });
        for (const user of adminUsers) {
            await this.mailService.sendMail(user.email, 'Payment Successful', `Your subscription payment was successful. Your subscription is now extended until ${expiresAt.toLocaleDateString()}.`);
        }
    }
    async handleFailedPayment(event) {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const organization = await this.prisma.organization.findFirst({
            where: { subscriptionId },
        });
        if (!organization)
            return;
        const adminUsers = await this.prisma.user.findMany({
            where: { organizationId: organization.id, role: 'ADMIN' },
        });
        for (const user of adminUsers) {
            await this.mailService.sendMail(user.email, 'Payment Failed', 'Your subscription payment has failed. Please update your payment method to avoid service interruption.');
        }
    }
    async handleSubscriptionCanceled(event) {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const organization = await this.prisma.organization.findFirst({
            where: { subscriptionId },
        });
        if (!organization)
            return;
        await this.prisma.organization.update({
            where: { id: organization.id ?? undefined },
            data: { subscriptionPlan: SubscriptionPlanType.FREE, subscriptionId: undefined },
        });
        const adminUsers = await this.prisma.user.findMany({
            where: { organizationId: organization.id, role: 'ADMIN' },
        });
        for (const user of adminUsers) {
            await this.mailService.sendMail(user.email, 'Subscription Canceled', 'Your subscription has been canceled. Some features may no longer be available.');
        }
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        mail_service_1.MailService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map