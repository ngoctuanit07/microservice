import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { StripeService } from './stripe.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [SubscriptionService, StripeService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, StripeService],
})
export class SubscriptionModule {}
