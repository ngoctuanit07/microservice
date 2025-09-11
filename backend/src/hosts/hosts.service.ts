// backend/src/hosts/hosts.service.ts
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';
import { encryptSecret, decryptSecret } from './crypto.util';
import { AuditLogService } from '../common/audit-log.service';
import { MailService } from '../common/mail.service';
import { TelegramService } from '../common/telegram.service';
import { SimpleCacheService } from '../common/simple-cache.service';

@Injectable()
export class HostsService {
  private key: Buffer;

  constructor(
    private prisma: PrismaService,
  @Inject(AuditLogService) private auditLog: AuditLogService,
  @Inject(MailService) private mailService: MailService,
  @Inject(TelegramService) private telegram: TelegramService,
  @Inject(SimpleCacheService) private cache: SimpleCacheService,
  ) {
    // Khởi tạo key an toàn, với giá trị mặc định nếu không có biến môi trường
    const secretKey = process.env.HOST_SECRET_KEY || 'dGhpc19pc19hX2RlZmF1bHRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5'; // key mặc định cho dev
    this.key = Buffer.from(secretKey, 'base64');
  }

  async notifyExpiringHosts() {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3); // 3 ngày tới
    const hosts = await this.prisma.host.findMany({
      where: { expiredAt: { lte: soon, gte: new Date() } },
  // include: { },
    });
    for (const host of hosts) {
      // Giả sử có trường email của user quản lý host, ở đây demo gửi tới admin
      await this.mailService.sendMail(
        'admin@example.com',
        `Host #${host.id} sắp hết hạn`,
        `Host ${host.ip}:${host.port} sẽ hết hạn vào ${host.expiredAt.toISOString()}`
      );
      await this.telegram.sendMessage(
        `Host #${host.id} (${host.ip}:${host.port}) sẽ hết hạn vào ${host.expiredAt.toISOString()}`
      );
    }
    return { notified: hosts.length };
  }

  async create(dto: CreateHostDto, userEmail?: string) {
    const pwdEnc = encryptSecret(dto.pwd, this.key);
    let userId: number | undefined;
    if (userEmail) {
      const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
      userId = user?.id;
    }
    const data: any = {
      ip: dto.ip,
      port: dto.port,
      uid: dto.uid,
      pwdEnc,
      purchasedAt: new Date(dto.purchasedAt),
      expiredAt: new Date(dto.expiredAt),
      notes: dto.notes,
    };
    if (userId) {
      data.user = { connect: { id: userId } };
    }
    const host = await this.prisma.host.create({ data });
    if (userEmail) await this.auditLog.log(userEmail, 'create', host.id, JSON.stringify(dto));
    return host;
  }

  async findAll(q?: { search?: string; page?: number; pageSize?: number; expiringInDays?: number; ip?: string; uid?: string; notes?: string; purchasedFrom?: string; purchasedTo?: string; expiredFrom?: string; expiredTo?: string }) {
    const page = Math.max(1, Number(q?.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q?.pageSize ?? 10)));

    const where: any = {};
    if (q?.search) {
      where.OR = [
        { ip: { contains: q.search } },
        { uid: { contains: q.search } },
        { notes: { contains: q.search } },
      ];
    }
    if (q?.ip) where.ip = { contains: q.ip };
    if (q?.uid) where.uid = { contains: q.uid };
    if (q?.notes) where.notes = { contains: q.notes };
    if (q?.purchasedFrom || q?.purchasedTo) {
      where.purchasedAt = {};
      if (q.purchasedFrom) where.purchasedAt.gte = new Date(q.purchasedFrom);
      if (q.purchasedTo) where.purchasedAt.lte = new Date(q.purchasedTo);
    }
    if (q?.expiredFrom || q?.expiredTo) {
      where.expiredAt = where.expiredAt || {};
      if (q.expiredFrom) where.expiredAt.gte = new Date(q.expiredFrom);
      if (q.expiredTo) where.expiredAt.lte = new Date(q.expiredTo);
    }
    if (q?.expiringInDays) {
      const until = new Date();
      until.setDate(until.getDate() + q.expiringInDays);
      where.expiredAt = { ...(where.expiredAt || {}), lte: until };
    }

    const cacheKey = 'hosts:' + JSON.stringify({ ...q, page, pageSize });
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.host.findMany({
        where, orderBy: { expiredAt: 'asc' },
        skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.prisma.host.count({ where }),
    ]);

    const result = { items, total, page, pageSize };
    this.cache.set(cacheKey, result, 30 * 1000); // cache 30 giây
    return result;
  }

  async findOne(id: number) {
    const host = await this.prisma.host.findUnique({ where: { id } });
    if (!host) throw new NotFoundException();
    return host;
  }

  async revealPassword(id: number): Promise<{ pwd: string }> {
    const host = await this.findOne(id);
    return { pwd: decryptSecret(host.pwdEnc, this.key) };
  }

  async update(id: number, dto: Partial<CreateHostDto>, userEmail?: string) {
    const data: any = { ...dto };
    if (dto.pwd) data.pwdEnc = encryptSecret(dto.pwd, this.key);
    if (dto.purchasedAt) data.purchasedAt = new Date(dto.purchasedAt);
    if (dto.expiredAt) data.expiredAt = new Date(dto.expiredAt);
    delete data.pwd;

    const host = await this.prisma.host.update({ where: { id }, data });
    if (userEmail) await this.auditLog.log(userEmail, 'update', id, JSON.stringify(dto));
    return host;
  }

  async remove(id: number, userEmail?: string) {
    const host = await this.prisma.host.delete({ where: { id } });
    if (userEmail) await this.auditLog.log(userEmail, 'delete', id, JSON.stringify(host));
    return host;
  }
}
