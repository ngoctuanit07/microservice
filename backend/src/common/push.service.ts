import { Injectable } from '@nestjs/common';
import webpush from 'web-push';

@Injectable()
export class PushService {
  constructor() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:admin@example.com',
        publicKey,
        privateKey
      );
    } else {
      // Có thể log cảnh báo nếu thiếu key
      console.warn('VAPID_PUBLIC_KEY hoặc VAPID_PRIVATE_KEY chưa được thiết lập. Push notification sẽ không hoạt động.');
    }
  }

  async sendPush(subscription: any, payload: string) {
    await webpush.sendNotification(subscription, payload);
  }
}
