// backend/src/hosts/hosts.service.ts
import { Injectable, NotFoundException, Inject, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';
import { encryptSecret, decryptSecret } from './crypto.util';
import { AuditLogService } from '../common/audit-log.service';
import { MailService } from '../common/mail.service';
import { TelegramService } from '../common/telegram.service';
import { SimpleCacheService } from '../common/simple-cache.service';

@Injectable()
export class HostsService {
  private key: Buffer;
  private readonly logger = new Logger(HostsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(AuditLogService) private auditLog: AuditLogService,
    @Inject(MailService) private mailService: MailService,
    @Inject(TelegramService) private telegram: TelegramService,
    @Inject(SimpleCacheService) private cache: SimpleCacheService,
  ) {
    try {
      // Khởi tạo key an toàn, với giá trị mặc định nếu không có biến môi trường
      const secretKey = process.env.HOST_SECRET_KEY;
      
      if (!secretKey) {
        this.logger.warn('HOST_SECRET_KEY not set, using default key. This is not secure for production!');
        // key mặc định cho dev - in production should be set via environment variable
        this.key = Buffer.from('dGhpc19pc19hX2RlZmF1bHRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5', 'base64');
      } else {
        this.key = Buffer.from(secretKey, 'base64');
        this.logger.log('Encryption key initialized successfully');
      }
    } catch (error: any) {
      this.logger.error(`Failed to initialize encryption key: ${error.message || String(error)}`);
      throw new InternalServerErrorException('Failed to initialize encryption service');
    }
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
    try {
      if (!dto.ip || !dto.uid || !dto.pwd) {
        throw new BadRequestException('Required fields missing: ip, uid, or password');
      }
      
      const pwdEnc = encryptSecret(dto.pwd, this.key);
      let userId: number | undefined;
      
      if (userEmail) {
        const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) {
          this.logger.warn(`Attempt to create host with non-existent user email: ${userEmail}`);
        } else {
          userId = user.id;
        }
      }
      
      const data: any = {
        ip: dto.ip,
        port: dto.port,
        uid: dto.uid,
        pwdEnc,
        purchasedAt: new Date(dto.purchasedAt || Date.now()),
        expiredAt: new Date(dto.expiredAt || Date.now()),
        notes: dto.notes || '',
      };
      
      if (userId) {
        data.user = { connect: { id: userId } };
      }
      
      const host = await this.prisma.host.create({ data });
      
      if (userEmail) {
        await this.auditLog.log(userEmail, 'create', host.id, JSON.stringify({
          ...dto,
          pwd: '[REDACTED]' // Don't log the password
        }));
      }
      
      this.logger.log(`Host created successfully: ID ${host.id}`);
      return host;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to create host: ${error.message || String(error)}`);
      throw new InternalServerErrorException('Failed to create host');
    }
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

  async revealPassword(id: number, userEmail?: string): Promise<{ pwd: string }> {
    const host = await this.findOne(id);
    // Log the password reveal action
    if (userEmail) {
      await this.auditLog.log(userEmail, 'reveal-password', id, 'Password revealed');
    }
    return { pwd: decryptSecret(host.pwdEnc, this.key) };
  }

  async update(id: number, dto: UpdateHostDto, userEmail?: string) {
    try {
      // Check if host exists
      await this.findOne(id);
      
      // Prepare update data
      const data: any = { ...dto };
      
      // Handle special fields
      if (dto.pwd) {
        data.pwdEnc = encryptSecret(dto.pwd, this.key);
        delete data.pwd; // Remove plain pwd from data
      }
      
      if (dto.purchasedAt) data.purchasedAt = new Date(dto.purchasedAt);
      if (dto.expiredAt) data.expiredAt = new Date(dto.expiredAt);
      
      // Handle user relationship if userId is provided
      if (dto.userId) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
        if (!user) {
          throw new BadRequestException(`User with ID ${dto.userId} not found`);
        }
        data.user = { connect: { id: dto.userId } };
        delete data.userId;
      }
      
      // Update the host
      const host = await this.prisma.host.update({ 
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      });
      
      // Log the update
      if (userEmail) {
        await this.auditLog.log(
          userEmail, 
          'update', 
          id, 
          JSON.stringify({
            ...dto,
            pwd: dto.pwd ? '[REDACTED]' : undefined
          })
        );
      }
      
      // Clear cache for this host
      this.cache.del(`host:${id}`);
      
      this.logger.log(`Host ${id} updated successfully by ${userEmail || 'system'}`);
      return host;
    } catch (error: any) {
      this.logger.error(`Failed to update host ${id}: ${error.message || String(error)}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update host');
    }
  }

  async remove(id: number, userEmail?: string) {
    try {
      // Check if host exists first
      const host = await this.findOne(id);
      
      // Delete the host
      await this.prisma.host.delete({ where: { id } });
      
      // Log the deletion
      if (userEmail) {
        await this.auditLog.log(
          userEmail, 
          'delete', 
          id, 
          JSON.stringify({
            ip: host.ip,
            port: host.port,
            uid: host.uid
          })
        );
      }
      
      // Clear cache for this host
      this.cache.del(`host:${id}`);
      this.cache.delByPattern('hosts:*'); // Clear all host list caches
      
      this.logger.log(`Host ${id} deleted by ${userEmail || 'system'}`);
      return { success: true, message: `Host ${id} deleted successfully` };
    } catch (error: any) {
      this.logger.error(`Failed to delete host ${id}: ${error.message || String(error)}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete host');
    }
  }
  
  async batchImport(hosts: CreateHostDto[], userEmail?: string) {
    try {
      this.logger.log(`Batch importing ${hosts.length} hosts`);
      
      // Track success and failures
      const results = {
        total: hosts.length,
        successful: 0,
        failed: 0,
        failures: [] as any[]
      };
      
      // Process each host
      for (const dto of hosts) {
        try {
          // Create the host
          await this.create(dto, userEmail);
          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.failures.push({
            host: {
              ip: dto.ip,
              port: dto.port,
              uid: dto.uid
            },
            error: error.message || String(error)
          });
        }
      }
      
      // Clear all host list caches
      this.cache.delByPattern('hosts:*');
      
      return results;
    } catch (error: any) {
      this.logger.error(`Batch import failed: ${error.message || String(error)}`);
      throw new InternalServerErrorException('Failed to import hosts');
    }
  }
  
  async batchUpdate(updates: { id: number, data: UpdateHostDto }[], userEmail?: string) {
    try {
      this.logger.log(`Batch updating ${updates.length} hosts`);
      
      // Track success and failures
      const results = {
        total: updates.length,
        successful: 0,
        failed: 0,
        failures: [] as any[]
      };
      
      // Process each update
      for (const update of updates) {
        try {
          // Update the host
          await this.update(update.id, update.data, userEmail);
          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.failures.push({
            hostId: update.id,
            error: error.message || String(error)
          });
        }
      }
      
      // Clear all host list caches
      this.cache.delByPattern('hosts:*');
      
      return results;
    } catch (error: any) {
      this.logger.error(`Batch update failed: ${error.message || String(error)}`);
      throw new InternalServerErrorException('Failed to update hosts');
    }
  }
}
