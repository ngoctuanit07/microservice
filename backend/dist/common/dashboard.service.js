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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(userId) {
        const [hostsCount, activeHosts, expiringHosts, totalTransactions, alerts] = await Promise.all([
            this.prisma.host.count({
                where: { userId }
            }),
            this.prisma.host.count({
                where: {
                    userId,
                    status: 'ACTIVE',
                    expiredAt: { gt: new Date() }
                }
            }),
            this.prisma.host.count({
                where: {
                    userId,
                    status: 'ACTIVE',
                    expiredAt: {
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        gt: new Date()
                    }
                }
            }),
            this.prisma.transaction.count(),
            this.prisma.alert.count({
                where: {
                    host: { userId },
                    status: { in: ['PENDING'] }
                }
            })
        ]);
        const uptimePercentage = Math.round(95 + Math.random() * 4);
        return {
            hostsCount,
            activeHosts,
            expiringHosts,
            expiredHosts: hostsCount - activeHosts,
            totalTransactions,
            pendingAlerts: alerts,
            uptimePercentage,
            healthStatus: alerts === 0 ? 'excellent' : alerts <= 2 ? 'good' : 'needs-attention'
        };
    }
    async getRecentActivities(userId) {
        const activities = await this.prisma.auditLog.findMany({
            where: {
                OR: [
                    { userEmail: { contains: '@' } },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return activities.map(activity => ({
            id: activity.id,
            action: activity.action,
            entityType: activity.entityType,
            entityId: activity.entityId,
            detail: activity.detail,
            createdAt: activity.createdAt,
            icon: this.getActivityIcon(activity.action),
            color: this.getActivityColor(activity.action)
        }));
    }
    async getAlerts(userId) {
        const alerts = await this.prisma.alert.findMany({
            where: {
                host: { userId },
                status: { in: ['PENDING'] }
            },
            include: {
                host: {
                    select: { ip: true, port: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        return alerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            message: alert.message,
            severity: this.getAlertSeverity(alert.type),
            host: alert.host ? `${alert.host.ip}:${alert.host.port}` : null,
            createdAt: alert.createdAt,
            actionRequired: this.getActionRequired(alert.type)
        }));
    }
    async getFinancialOverview(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                date: {
                    gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { date: 'asc' }
        });
        const monthlyData = transactions.reduce((acc, transaction) => {
            const month = transaction.date.toISOString().substring(0, 7);
            if (!acc[month]) {
                acc[month] = { income: 0, expense: 0 };
            }
            if (transaction.type === 'INCOME') {
                acc[month].income += transaction.amount;
            }
            else {
                acc[month].expense += transaction.amount;
            }
            return acc;
        }, {});
        const chartData = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            income: data.income,
            expense: data.expense,
            profit: data.income - data.expense
        }));
        const totalIncome = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            chartData,
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            monthlyAverage: chartData.length ?
                chartData.reduce((sum, data) => sum + data.profit, 0) / chartData.length : 0
        };
    }
    getActivityIcon(action) {
        const iconMap = {
            'CREATE': '➕',
            'UPDATE': '✏️',
            'DELETE': '🗑️',
            'LOGIN': '🔐',
            'LOGOUT': '🚪',
            'PAYMENT': '💰'
        };
        return iconMap[action] || '📝';
    }
    getActivityColor(action) {
        const colorMap = {
            'CREATE': 'success',
            'UPDATE': 'primary',
            'DELETE': 'danger',
            'LOGIN': 'info',
            'LOGOUT': 'secondary',
            'PAYMENT': 'warning'
        };
        return colorMap[action] || 'secondary';
    }
    getAlertSeverity(type) {
        const severityMap = {
            'EXPIRY': 'medium',
            'DOWN': 'high',
            'SECURITY': 'critical'
        };
        return severityMap[type] || 'low';
    }
    getActionRequired(type) {
        const actionMap = {
            'EXPIRY': 'Renew hosting before expiration',
            'DOWN': 'Check server status and restart if needed',
            'SECURITY': 'Review security settings immediately'
        };
        return actionMap[type] || 'Review and take action';
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map