import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { GetUser } from './decorators/get-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(@GetUser() user: any) {
    return this.dashboardService.getDashboardStats(user.id);
  }

  @Get('recent-activities')
  async getRecentActivities(@GetUser() user: any) {
    return this.dashboardService.getRecentActivities(user.id);
  }

  @Get('alerts')
  async getAlerts(@GetUser() user: any) {
    return this.dashboardService.getAlerts(user.id);
  }

  @Get('financial-overview')
  async getFinancialOverview(@GetUser() user: any) {
    return this.dashboardService.getFinancialOverview(user.id);
  }
}