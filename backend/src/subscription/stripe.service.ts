import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionPlanType } from './subscription.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly priceIds: Record<SubscriptionPlanType, string> = {
    FREE: '',  // Free plan doesn't have a price ID
    BASIC: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic',
    PRO: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
    ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise',
  };

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_default', {
      apiVersion: '2025-08-27.basil', // Match expected type
    });

    if (!process.env.STRIPE_SECRET_KEY) {
      this.logger.warn('STRIPE_SECRET_KEY not set. Using test mode.');
    }
  }

  async createCustomer({ email, name, paymentMethodId }: { email: string; name: string; paymentMethodId?: string }) {
    try {
      const customerData: Stripe.CustomerCreateParams = {
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
    } catch (error: any) {
      this.logger.error(`Error creating customer: ${error.message}`);
      throw error;
    }
  }

  async updateDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      // Attach the payment method to the customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      this.logger.log(`Updated payment method for customer ${customerId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error updating payment method: ${error.message}`);
      throw error;
    }
  }

  async createSubscription(customerId: string, planType: SubscriptionPlanType) {
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
    } catch (error: any) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`Subscription canceled: ${subscriptionId}`);
      return subscription;
    } catch (error: any) {
      this.logger.error(`Error canceling subscription: ${error.message}`);
      throw error;
    }
  }

  async createCheckoutSession(customerId: string, planType: SubscriptionPlanType, successUrl: string, cancelUrl: string) {
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
    } catch (error: any) {
      this.logger.error(`Error creating checkout session: ${error.message}`);
      throw error;
    }
  }

  async createSetupIntent(customerId: string) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });

      return setupIntent;
    } catch (error: any) {
      this.logger.error(`Error creating setup intent: ${error.message}`);
      throw error;
    }
  }

  async validateWebhookSignature(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      return true;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error: any) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      return false;
    }
  }

  async getInvoices(customerId: string, limit = 10) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });
      return invoices.data;
    } catch (error: any) {
      this.logger.error(`Error fetching invoices: ${error.message}`);
      throw error;
    }
  }
}
