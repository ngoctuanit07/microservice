import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationData {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export interface AlertData {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  host?: string;
  actionRequired: string;
  hostId?: number;
}

@Injectable()
export class NotificationService {
  constructor(
    private notificationGateway: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  // Send realtime notification
  async sendNotification(userId: number, notification: NotificationData) {
    // Save to database
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'PUSH',
        message: `${notification.title}: ${notification.message}`,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Send realtime via WebSocket
    this.notificationGateway.sendNotificationToUser(userId, notification);
  }

  // Send alert
  async sendAlert(userId: number, alert: AlertData) {
    // Create alert in database
    const alertRecord = await this.prisma.alert.create({
      data: {
        type: alert.type,
        message: alert.message,
        hostId: alert.hostId || null,
      },
    });

    // Send realtime alert
    this.notificationGateway.sendAlertToUser(userId, {
      ...alert,
      id: alertRecord.id,
    });

    return alertRecord;
  }

  // Check and send host expiry notifications
  async checkHostExpirations() {
    const expiringHosts = await this.prisma.host.findMany({
      where: {
        expiredAt: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          gt: new Date(),
        },
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    });

    for (const host of expiringHosts) {
      const daysUntilExpiry = Math.ceil(
        (host.expiredAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      await this.sendAlert(host.userId, {
        severity: daysUntilExpiry <= 1 ? 'critical' : daysUntilExpiry <= 3 ? 'high' : 'medium',
        type: 'EXPIRY',
        message: `Host ${host.ip}:${host.port} will expire in ${daysUntilExpiry} day(s)`,
        host: `${host.ip}:${host.port}`,
        actionRequired: 'Please renew the host before expiration',
        hostId: host.id,
      });

      await this.sendNotification(host.userId, {
        type: 'warning',
        title: 'Host Expiring Soon',
        message: `Your host ${host.ip}:${host.port} expires in ${daysUntilExpiry} day(s)`,
        actionUrl: `/hosts/${host.id}/edit`,
        metadata: { hostId: host.id, daysLeft: daysUntilExpiry },
      });
    }

    return expiringHosts.length;
  }

  // Send host status update
  async sendHostStatusUpdate(hostId: number, status: string) {
    const host = await this.prisma.host.findUnique({
      where: { id: hostId },
      include: { user: true },
    });

    if (!host) return;

    this.notificationGateway.sendHostStatusUpdate(host.userId, {
      hostId,
      status,
      lastCheckedAt: new Date(),
    });

    if (status === 'DOWN') {
      await this.sendAlert(host.userId, {
        severity: 'high',
        type: 'DOWN',
        message: `Host ${host.ip}:${host.port} is currently down`,
        host: `${host.ip}:${host.port}`,
        actionRequired: 'Check host status and restart if necessary',
        hostId,
      });
    }
  }

  // Send welcome notification for new users
  async sendWelcomeNotification(userId: number, userName?: string) {
    await this.sendNotification(userId, {
      type: 'success',
      title: 'Welcome!',
      message: `Welcome to the hosting management system${userName ? `, ${userName}` : ''}! Start by adding your first host.`,
      actionUrl: '/hosts/new',
    });
  }

  // Send system maintenance notification
  async sendMaintenanceNotification(message: string, scheduledTime?: Date) {
    this.notificationGateway.sendSystemBroadcast({
      text: message,
      type: 'warning',
      scheduledTime,
    });
  }

  // Get user's unread notifications count
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        status: { in: ['PENDING', 'SENT'] },
      },
    });
    
    return count;
  }

  // Mark notifications as read
  async markNotificationsAsRead(userId: number, notificationIds?: number[]) {
    const where: any = { userId };
    if (notificationIds) {
      where.id = { in: notificationIds };
    }

    await this.prisma.notification.updateMany({
      where,
      data: { status: 'READ' },
    });
  }
}