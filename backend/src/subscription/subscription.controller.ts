import { Controller, Post, Body, Get, Param, Delete, UseGuards, Req, HttpCode, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SubscriptionService, SubscriptionPlanType } from './subscription.service';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getAvailablePlans() {
    return {
      plans: [
        {
          type: SubscriptionPlanType.FREE,
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
          type: SubscriptionPlanType.BASIC,
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
          type: SubscriptionPlanType.PRO,
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
          type: SubscriptionPlanType.ENTERPRISE,
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

  @Get('current')
  async getCurrentSubscription(@Req() req: any) {
    return this.subscriptionService.getSubscriptionPlan(req.user.sub);
  }

  @Post('create')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async createSubscription(
    @Req() req: any,
    @Body() body: { planType: SubscriptionPlanType; paymentMethodId: string }
  ) {
    return this.subscriptionService.createSubscription(
      req.user.sub,
      body.planType,
      body.paymentMethodId
    );
  }

  @Delete('cancel')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(200)
  async cancelSubscription(@Req() req: any) {
    return this.subscriptionService.cancelSubscription(req.user.sub);
  }

  @Get('feature-access/:feature')
  async checkFeatureAccess(@Req() req: any, @Param('feature') feature: string) {
    return this.subscriptionService.checkFeatureAccess(req.user.sub, feature as any);
  }

  @Get('host-limit')
  async checkHostLimit(@Req() req: any) {
    return this.subscriptionService.checkHostLimit(req.user.sub);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: any, @Req() req: any) {
    return this.subscriptionService.handleStripeWebhook(payload);
  }

  @Get('checkout-session')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async createCheckoutSession(
    @Req() req: any,
    @Query('planType') planType: SubscriptionPlanType,
    @Query('successUrl') successUrl: string,
    @Query('cancelUrl') cancelUrl: string
  ) {
    // This would need to be implemented in the subscription service
    // by forwarding to the stripe service
    return { url: 'https://stripe-checkout-url-would-be-returned-here' };
  }
}
