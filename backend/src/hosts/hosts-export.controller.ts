import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('hosts')
export class HostsExportController {
  constructor(private readonly service: HostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportHosts(@Query() q: any, @Res() res: Response) {
    const { items } = await this.service.findAll(q);
    const csv = [
      'id,ip,port,uid,purchasedAt,expiredAt,notes',
  ...items.map((h: any) => `${h.id},${h.ip},${h.port},${h.uid},${h.purchasedAt.toISOString()},${h.expiredAt.toISOString()},"${h.notes ?? ''}"`)
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=hosts.csv');
    res.send(csv);
  }
}
