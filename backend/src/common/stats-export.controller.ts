import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import * as XLSX from 'xlsx';

@Controller('stats')
export class StatsExportController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportStats(@Res() res: Response) {
    const userCount = await this.prisma.user.count();
    const hostCount = await this.prisma.host.count();
    const expiringSoon = await this.prisma.host.count({
      where: {
        expiredAt: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const data = [
      { key: 'userCount', value: userCount },
      { key: 'hostCount', value: hostCount },
      { key: 'expiringSoon', value: expiringSoon },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stats');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stats.xlsx');
    res.send(buffer);
  }
}
