import { Injectable, Logger } from '@nestjs/common';
import webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private pushEnabled = false;

  constructor() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    if (publicKey && privateKey) {
      try {
        webpush.setVapidDetails(
          `mailto:${email}`,
          publicKey,
          privateKey
        );
        this.pushEnabled = true;
        this.logger.log('Push notifications are enabled');
      } catch (error: any) {
        this.logger.error(`Error setting up push notifications: ${error.message || String(error)}`);
      }
    } else {
      // Logging a warning but not throwing an error, as push notifications are optional
      this.logger.warn(
        'VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY not set. Push notifications will be disabled. ' +
        'To enable push notifications, generate keys with: npx web-push generate-vapid-keys'
      );
    }
  }

  async sendPush(subscription: any, payload: string): Promise<boolean> {
    if (!this.pushEnabled) {
      this.logger.warn('Attempted to send push notification, but push service is not configured');
      return false;
    }
    
    try {
      await webpush.sendNotification(subscription, payload);
      return true;
    } catch (error: any) {
      this.logger.error(`Error sending push notification: ${error.message || String(error)}`);
      return false;
    }
  }
}
