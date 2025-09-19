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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = StripeService_1 = class StripeService {
    constructor() {
        this.logger = new common_1.Logger(StripeService_1.name);
        this.priceIds = {
            FREE: '',
            BASIC: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic',
            PRO: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
            ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise',
        };
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_default', {
            apiVersion: '2025-08-27.basil',
        });
        if (!process.env.STRIPE_SECRET_KEY) {
            this.logger.warn('STRIPE_SECRET_KEY not set. Using test mode.');
        }
    }
    async createCustomer({ email, name, paymentMethodId }) {
        try {
            const customerData = {
                email,
                name,
            };
            if (paymentMethodId) {
                customerData.payment_method = paymentMethodId;
                customerData.invoice_settings = {
                    default_payment_method: paymentMethodId,
                };
            }
            const customer = await this.stripe.customers.create(customerData);
            this.logger.log(`Customer created: ${customer.id} for ${email}`);
            return customer;
        }
        catch (error) {
            this.logger.error(`Error creating customer: ${error.message}`);
            throw error;
        }
    }
    async updateDefaultPaymentMethod(customerId, paymentMethodId) {
        try {
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
            await this.stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            this.logger.log(`Updated payment method for customer ${customerId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating payment method: ${error.message}`);
            throw error;
        }
    }
    async createSubscription(customerId, planType) {
        try {
            if (planType === 'FREE') {
                return { id: 'free-plan', status: 'active' };
            }
            const priceId = this.priceIds[planType];
            if (!priceId) {
                throw new Error(`No price ID found for plan: ${planType}`);
            }
            const subscription = await this.stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
            });
            this.logger.log(`Subscription created: ${subscription.id} for customer ${customerId}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Error creating subscription: ${error.message}`);
            throw error;
        }
    }
    async cancelSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
            this.logger.log(`Subscription canceled: ${subscriptionId}`);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Error canceling subscription: ${error.message}`);
            throw error;
        }
    }
    async createCheckoutSession(customerId, planType, successUrl, cancelUrl) {
        try {
            if (planType === 'FREE') {
                throw new Error('Cannot create checkout session for FREE plan');
            }
            const priceId = this.priceIds[planType];
            if (!priceId) {
                throw new Error(`No price ID found for plan: ${planType}`);
            }
            const session = await this.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
            });
            return session;
        }
        catch (error) {
            this.logger.error(`Error creating checkout session: ${error.message}`);
            throw error;
        }
    }
    async createSetupIntent(customerId) {
        try {
            const setupIntent = await this.stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
            });
            return setupIntent;
        }
        catch (error) {
            this.logger.error(`Error creating setup intent: ${error.message}`);
            throw error;
        }
    }
    async validateWebhookSignature(payload, signature) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            this.logger.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
            return true;
        }
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            return event;
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error.message}`);
            return false;
        }
    }
    async getInvoices(customerId, limit = 10) {
        try {
            const invoices = await this.stripe.invoices.list({
                customer: customerId,
                limit,
            });
            return invoices.data;
        }
        catch (error) {
            this.logger.error(`Error fetching invoices: ${error.message}`);
            throw error;
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StripeService);
//# sourceMappingURL=stripe.service.js.map