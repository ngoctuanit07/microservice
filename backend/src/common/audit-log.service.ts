import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(userEmail: string, action: string, hostId?: number, detail?: string) {
    await this.prisma.auditLog.create({
      data: { userEmail, action, hostId, detail },
    });
  }
}
