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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_gateway_1 = require("./notification.gateway");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = class NotificationService {
    constructor(notificationGateway, prisma) {
        this.notificationGateway = notificationGateway;
        this.prisma = prisma;
    }
    async sendNotification(userId, notification) {
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'PUSH',
                message: `${notification.title}: ${notification.message}`,
                status: 'SENT',
                sentAt: new Date(),
            },
        });
        this.notificationGateway.sendNotificationToUser(userId, notification);
    }
    async sendAlert(userId, alert) {
        const alertRecord = await this.prisma.alert.create({
            data: {
                type: alert.type,
                message: alert.message,
                hostId: alert.hostId || null,
            },
        });
        this.notificationGateway.sendAlertToUser(userId, {
            ...alert,
            id: alertRecord.id,
        });
        return alertRecord;
    }
    async checkHostExpirations() {
        const expiringHosts = await this.prisma.host.findMany({
            where: {
                expiredAt: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    gt: new Date(),
                },
                status: 'ACTIVE',
            },
            include: {
                user: true,
            },
        });
        for (const host of expiringHosts) {
            const daysUntilExpiry = Math.ceil((host.expiredAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
    async sendHostStatusUpdate(hostId, status) {
        const host = await this.prisma.host.findUnique({
            where: { id: hostId },
            include: { user: true },
        });
        if (!host)
            return;
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
    async sendWelcomeNotification(userId, userName) {
        await this.sendNotification(userId, {
            type: 'success',
            title: 'Welcome!',
            message: `Welcome to the hosting management system${userName ? `, ${userName}` : ''}! Start by adding your first host.`,
            actionUrl: '/hosts/new',
        });
    }
    async sendMaintenanceNotification(message, scheduledTime) {
        this.notificationGateway.sendSystemBroadcast({
            text: message,
            type: 'warning',
            scheduledTime,
        });
    }
    async getUnreadNotificationsCount(userId) {
        const count = await this.prisma.notification.count({
            where: {
                userId,
                status: { in: ['PENDING', 'SENT'] },
            },
        });
        return count;
    }
    async markNotificationsAsRead(userId, notificationIds) {
        const where = { userId };
        if (notificationIds) {
            where.id = { in: notificationIds };
        }
        await this.prisma.notification.updateMany({
            where,
            data: { status: 'READ' },
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_gateway_1.NotificationGateway,
        prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map