import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: number) {
    const [hostsCount, activeHosts, expiringHosts, totalTransactions, alerts] = await Promise.all([
      // Tổng số hosts
      this.prisma.host.count({
        where: { userId }
      }),
      
      // Hosts đang hoạt động
      this.prisma.host.count({
        where: { 
          userId,
          status: 'ACTIVE',
          expiredAt: { gt: new Date() }
        }
      }),
      
      // Hosts sắp hết hạn (30 ngày)
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
      
      // Tổng transactions
      this.prisma.transaction.count(),
      
      // Alerts chưa resolve
      this.prisma.alert.count({
        where: {
          host: { userId },
          status: { in: ['PENDING'] }
        }
      })
    ]);

    // Tính uptime average (giả lập)
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

  async getRecentActivities(userId: number) {
    const activities = await this.prisma.auditLog.findMany({
      where: {
        OR: [
          { userEmail: { contains: '@' } }, // Tất cả users tạm thời
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

  async getAlerts(userId: number) {
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

  async getFinancialOverview(userId: number) {
    // Lấy dữ liệu tài chính
    const transactions = await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // 6 tháng
        }
      },
      orderBy: { date: 'asc' }
    });

    // Group by month
    const monthlyData = transactions.reduce((acc: Record<string, { income: number; expense: number }>, transaction) => {
      const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'INCOME') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
      
      return acc;
    }, {});

    const chartData = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      income: data.income,
      expense: data.expense,
      profit: data.income - data.expense
    }));

    // Tính tổng
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

  private getActivityIcon(action: string): string {
    const iconMap: Record<string, string> = {
      'CREATE': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'PAYMENT': '💰'
    };
    return iconMap[action] || '📝';
  }

  private getActivityColor(action: string): string {
    const colorMap: Record<string, string> = {
      'CREATE': 'success',
      'UPDATE': 'primary', 
      'DELETE': 'danger',
      'LOGIN': 'info',
      'LOGOUT': 'secondary',
      'PAYMENT': 'warning'
    };
    return colorMap[action] || 'secondary';
  }

  private getAlertSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'EXPIRY': 'medium',
      'DOWN': 'high', 
      'SECURITY': 'critical'
    };
    return severityMap[type] || 'low';
  }

  private getActionRequired(type: string): string {
    const actionMap: Record<string, string> = {
      'EXPIRY': 'Renew hosting before expiration',
      'DOWN': 'Check server status and restart if needed',
      'SECURITY': 'Review security settings immediately'
    };
    return actionMap[type] || 'Review and take action';
  }
}