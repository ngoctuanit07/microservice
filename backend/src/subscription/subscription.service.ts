import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { MailService } from '../common/mail.service';

export enum SubscriptionPlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface PlanFeatures {
  maxHosts: number;
  maxUsers: number;
  advancedSecurity: boolean;
  apiAccess: boolean;
  dedicatedSupport: boolean;
  customBranding: boolean;
  automatedBackups: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionPlanType, PlanFeatures> = {
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
    maxHosts: -1, // unlimited
    maxUsers: -1, // unlimited
    advancedSecurity: true,
    apiAccess: true,
    dedicatedSupport: true,
    customBranding: true,
    automatedBackups: true,
  },
};

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private mailService: MailService,
  ) {}

  async getSubscriptionPlan(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.organization) {
      return {
        plan: SubscriptionPlanType.FREE,
        features: PLAN_FEATURES[SubscriptionPlanType.FREE],
        expiresAt: null,
      };
    }

    return {
      plan: user.organization.subscriptionPlan as SubscriptionPlanType,
      features: PLAN_FEATURES[user.organization.subscriptionPlan as SubscriptionPlanType],
      expiresAt: user.organization.subscriptionExpiresAt,
      stripeCustomerId: user.organization.stripeCustomerId,
    };
  }

  async checkFeatureAccess(userId: number, feature: keyof PlanFeatures): Promise<boolean> {
    const { features } = await this.getSubscriptionPlan(userId);
    return !!features[feature];
  }

  async checkHostLimit(userId: number): Promise<{ allowed: boolean; current: number; limit: number }> {
    const { features } = await this.getSubscriptionPlan(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user || !user.organization) {
      throw new NotFoundException('User or organization not found');
    }

    // Count hosts in organization
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

  async createSubscription(userId: number, planType: SubscriptionPlanType, paymentMethodId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.organization) {
      throw new BadRequestException('User must be part of an organization');
    }

    // Create or update Stripe customer
    let stripeCustomerId = user.organization.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer({
        email: user.email,
        name: user.name || user.email,
        paymentMethodId,
      });
      stripeCustomerId = customer.id;
    } else {
      await this.stripeService.updateDefaultPaymentMethod(stripeCustomerId, paymentMethodId);
    }

    // Create subscription in Stripe
    const subscription = await this.stripeService.createSubscription(stripeCustomerId, planType);

    // Update organization with subscription details
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        subscriptionPlan: planType,
        subscriptionId: subscription.id,
        stripeCustomerId: stripeCustomerId,
        subscriptionExpiresAt: expiresAt,
      },
    });

    // Send confirmation email
    await this.mailService.sendMail(
      user.email,
      `Subscription Confirmed: ${planType} Plan`,
      `Thank you for subscribing to the ${planType} plan. Your subscription is now active.`
    );

    return {
      success: true,
      plan: planType,
      features: PLAN_FEATURES[planType],
      expiresAt,
      subscriptionId: subscription.id,
    };
  }

  async cancelSubscription(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user || !user.organization) {
      throw new NotFoundException('User or organization not found');
    }

    const { subscriptionId } = user.organization;
    if (!subscriptionId) {
      throw new BadRequestException('No active subscription to cancel');
    }

    // Cancel in Stripe
    await this.stripeService.cancelSubscription(subscriptionId);

    // Update in database
    await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        subscriptionPlan: SubscriptionPlanType.FREE,
        subscriptionId: null,
      },
    });

    // Send email notification
    await this.mailService.sendMail(
      user.email,
      'Subscription Canceled',
      'Your subscription has been canceled. You can resubscribe at any time from your account settings.'
    );

    return {
      success: true,
      message: 'Subscription successfully canceled',
    };
  }

  async handleStripeWebhook(event: any) {
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

  private async handleSuccessfulPayment(event: any) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    const organization = await this.prisma.organization.findFirst({
      where: { subscriptionId },
    });

    if (!organization) return;

    // Extend subscription expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: { subscriptionExpiresAt: expiresAt },
    });

    // Notify admin users
    const adminUsers = await this.prisma.user.findMany({
      where: { organizationId: organization.id, role: 'ADMIN' },
    });

    for (const user of adminUsers) {
      await this.mailService.sendMail(
        user.email,
        'Payment Successful',
        `Your subscription payment was successful. Your subscription is now extended until ${expiresAt.toLocaleDateString()}.`
      );
    }
  }

  private async handleFailedPayment(event: any) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    const organization = await this.prisma.organization.findFirst({
      where: { subscriptionId },
    });

    if (!organization) return;

    // Notify admin users
    const adminUsers = await this.prisma.user.findMany({
      where: { organizationId: organization.id, role: 'ADMIN' },
    });

    for (const user of adminUsers) {
      await this.mailService.sendMail(
        user.email,
        'Payment Failed',
        'Your subscription payment has failed. Please update your payment method to avoid service interruption.'
      );
    }
  }

  private async handleSubscriptionCanceled(event: any) {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;

    const organization = await this.prisma.organization.findFirst({
      where: { subscriptionId },
    });

    if (!organization) return;

    // Update organization to free plan
    await this.prisma.organization.update({
      where: { id: organization.id },
      data: { subscriptionPlan: SubscriptionPlanType.FREE, subscriptionId: null },
    });

    // Notify admin users
    const adminUsers = await this.prisma.user.findMany({
      where: { organizationId: organization.id, role: 'ADMIN' },
    });

    for (const user of adminUsers) {
      await this.mailService.sendMail(
        user.email,
        'Subscription Canceled',
        'Your subscription has been canceled. Some features may no longer be available.'
      );
    }
  }
}
