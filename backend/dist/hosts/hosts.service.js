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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var HostsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_util_1 = require("./crypto.util");
const audit_log_service_1 = require("../common/audit-log.service");
const mail_service_1 = require("../common/mail.service");
const telegram_service_1 = require("../common/telegram.service");
const simple_cache_service_1 = require("../common/simple-cache.service");
let HostsService = HostsService_1 = class HostsService {
    constructor(prisma, auditLog, mailService, telegram, cache) {
        this.prisma = prisma;
        this.auditLog = auditLog;
        this.mailService = mailService;
        this.telegram = telegram;
        this.cache = cache;
        this.logger = new common_1.Logger(HostsService_1.name);
        try {
            const secretKey = process.env.HOST_SECRET_KEY;
            if (!secretKey) {
                this.logger.warn('HOST_SECRET_KEY not set, using default key. This is not secure for production!');
                this.key = Buffer.from('dGhpc19pc19hX2RlZmF1bHRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5', 'base64');
            }
            else {
                this.key = Buffer.from(secretKey, 'base64');
                this.logger.log('Encryption key initialized successfully');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize encryption key: ${error.message || String(error)}`);
            throw new common_1.InternalServerErrorException('Failed to initialize encryption service');
        }
    }
    async notifyExpiringHosts() {
        const soon = new Date();
        soon.setDate(soon.getDate() + 3);
        const hosts = await this.prisma.host.findMany({
            where: { expiredAt: { lte: soon, gte: new Date() } },
        });
        for (const host of hosts) {
            await this.mailService.sendMail('admin@example.com', `Host #${host.id} sắp hết hạn`, `Host ${host.ip}:${host.port} sẽ hết hạn vào ${host.expiredAt.toISOString()}`);
            await this.telegram.sendMessage(`Host #${host.id} (${host.ip}:${host.port}) sẽ hết hạn vào ${host.expiredAt.toISOString()}`);
        }
        return { notified: hosts.length };
    }
    async create(dto, userEmail) {
        try {
            if (!dto.ip || !dto.uid || !dto.pwd) {
                throw new common_1.BadRequestException('Required fields missing: ip, uid, or password');
            }
            const pwdEnc = (0, crypto_util_1.encryptSecret)(dto.pwd, this.key);
            let userId;
            if (userEmail) {
                const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
                if (!user) {
                    this.logger.warn(`Attempt to create host with non-existent user email: ${userEmail}`);
                }
                else {
                    userId = user.id;
                }
            }
            const data = {
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
                    pwd: '[REDACTED]'
                }));
            }
            this.logger.log(`Host created successfully: ID ${host.id}`);
            return host;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to create host: ${error.message || String(error)}`);
            throw new common_1.InternalServerErrorException('Failed to create host');
        }
    }
    async findAll(q) {
        const page = Math.max(1, Number(q?.page ?? 1));
        const pageSize = Math.min(100, Math.max(1, Number(q?.pageSize ?? 10)));
        const where = {};
        if (q?.search) {
            where.OR = [
                { ip: { contains: q.search } },
                { uid: { contains: q.search } },
                { notes: { contains: q.search } },
            ];
        }
        if (q?.ip)
            where.ip = { contains: q.ip };
        if (q?.uid)
            where.uid = { contains: q.uid };
        if (q?.notes)
            where.notes = { contains: q.notes };
        if (q?.purchasedFrom || q?.purchasedTo) {
            where.purchasedAt = {};
            if (q.purchasedFrom)
                where.purchasedAt.gte = new Date(q.purchasedFrom);
            if (q.purchasedTo)
                where.purchasedAt.lte = new Date(q.purchasedTo);
        }
        if (q?.expiredFrom || q?.expiredTo) {
            where.expiredAt = where.expiredAt || {};
            if (q.expiredFrom)
                where.expiredAt.gte = new Date(q.expiredFrom);
            if (q.expiredTo)
                where.expiredAt.lte = new Date(q.expiredTo);
        }
        if (q?.expiringInDays) {
            const until = new Date();
            until.setDate(until.getDate() + q.expiringInDays);
            where.expiredAt = { ...(where.expiredAt || {}), lte: until };
        }
        const cacheKey = 'hosts:' + JSON.stringify({ ...q, page, pageSize });
        const cached = this.cache.get(cacheKey);
        if (cached)
            return cached;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.host.findMany({
                where, orderBy: { expiredAt: 'asc' },
                skip: (page - 1) * pageSize, take: pageSize,
            }),
            this.prisma.host.count({ where }),
        ]);
        const result = { items, total, page, pageSize };
        this.cache.set(cacheKey, result, 30 * 1000);
        return result;
    }
    async findOne(id) {
        const host = await this.prisma.host.findUnique({ where: { id } });
        if (!host)
            throw new common_1.NotFoundException();
        return host;
    }
    async revealPassword(id, userEmail) {
        const host = await this.findOne(id);
        if (userEmail) {
            await this.auditLog.log(userEmail, 'reveal-password', id, 'Password revealed');
        }
        return { pwd: (0, crypto_util_1.decryptSecret)(host.pwdEnc, this.key) };
    }
    async update(id, dto, userEmail) {
        try {
            await this.findOne(id);
            const data = { ...dto };
            if (dto.pwd) {
                data.pwdEnc = (0, crypto_util_1.encryptSecret)(dto.pwd, this.key);
                delete data.pwd;
            }
            if (dto.purchasedAt)
                data.purchasedAt = new Date(dto.purchasedAt);
            if (dto.expiredAt)
                data.expiredAt = new Date(dto.expiredAt);
            if (dto.userId) {
                const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
                if (!user) {
                    throw new common_1.BadRequestException(`User with ID ${dto.userId} not found`);
                }
                data.user = { connect: { id: dto.userId } };
                delete data.userId;
            }
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
            if (userEmail) {
                await this.auditLog.log(userEmail, 'update', id, JSON.stringify({
                    ...dto,
                    pwd: dto.pwd ? '[REDACTED]' : undefined
                }));
            }
            this.cache.del(`host:${id}`);
            this.logger.log(`Host ${id} updated successfully by ${userEmail || 'system'}`);
            return host;
        }
        catch (error) {
            this.logger.error(`Failed to update host ${id}: ${error.message || String(error)}`);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update host');
        }
    }
    async remove(id, userEmail) {
        try {
            const host = await this.findOne(id);
            await this.prisma.host.delete({ where: { id } });
            if (userEmail) {
                await this.auditLog.log(userEmail, 'delete', id, JSON.stringify({
                    ip: host.ip,
                    port: host.port,
                    uid: host.uid
                }));
            }
            this.cache.del(`host:${id}`);
            this.cache.delByPattern('hosts:*');
            this.logger.log(`Host ${id} deleted by ${userEmail || 'system'}`);
            return { success: true, message: `Host ${id} deleted successfully` };
        }
        catch (error) {
            this.logger.error(`Failed to delete host ${id}: ${error.message || String(error)}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete host');
        }
    }
    async batchImport(hosts, userEmail) {
        try {
            this.logger.log(`Batch importing ${hosts.length} hosts`);
            const results = {
                total: hosts.length,
                successful: 0,
                failed: 0,
                failures: []
            };
            for (const dto of hosts) {
                try {
                    await this.create(dto, userEmail);
                    results.successful++;
                }
                catch (error) {
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
            this.cache.delByPattern('hosts:*');
            return results;
        }
        catch (error) {
            this.logger.error(`Batch import failed: ${error.message || String(error)}`);
            throw new common_1.InternalServerErrorException('Failed to import hosts');
        }
    }
    async batchUpdate(updates, userEmail) {
        try {
            this.logger.log(`Batch updating ${updates.length} hosts`);
            const results = {
                total: updates.length,
                successful: 0,
                failed: 0,
                failures: []
            };
            for (const update of updates) {
                try {
                    await this.update(update.id, update.data, userEmail);
                    results.successful++;
                }
                catch (error) {
                    results.failed++;
                    results.failures.push({
                        hostId: update.id,
                        error: error.message || String(error)
                    });
                }
            }
            this.cache.delByPattern('hosts:*');
            return results;
        }
        catch (error) {
            this.logger.error(`Batch update failed: ${error.message || String(error)}`);
            throw new common_1.InternalServerErrorException('Failed to update hosts');
        }
    }
};
exports.HostsService = HostsService;
exports.HostsService = HostsService = HostsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(audit_log_service_1.AuditLogService)),
    __param(2, (0, common_1.Inject)(mail_service_1.MailService)),
    __param(3, (0, common_1.Inject)(telegram_service_1.TelegramService)),
    __param(4, (0, common_1.Inject)(simple_cache_service_1.SimpleCacheService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        mail_service_1.MailService,
        telegram_service_1.TelegramService,
        simple_cache_service_1.SimpleCacheService])
], HostsService);
//# sourceMappingURL=hosts.service.js.map