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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_util_1 = require("./crypto.util");
const audit_log_service_1 = require("../common/audit-log.service");
const mail_service_1 = require("../common/mail.service");
const telegram_service_1 = require("../common/telegram.service");
const simple_cache_service_1 = require("../common/simple-cache.service");
let HostsService = class HostsService {
    constructor(prisma, auditLog, mailService, telegram, cache) {
        this.prisma = prisma;
        this.auditLog = auditLog;
        this.mailService = mailService;
        this.telegram = telegram;
        this.cache = cache;
        this.key = Buffer.from(process.env.HOST_SECRET_KEY, 'base64');
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
        const pwdEnc = (0, crypto_util_1.encryptSecret)(dto.pwd, this.key);
        let userId;
        if (userEmail) {
            const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
            userId = user?.id;
        }
        const data = {
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
        if (userEmail)
            await this.auditLog.log(userEmail, 'create', host.id, JSON.stringify(dto));
        return host;
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
    async revealPassword(id) {
        const host = await this.findOne(id);
        return { pwd: (0, crypto_util_1.decryptSecret)(host.pwdEnc, this.key) };
    }
    async update(id, dto, userEmail) {
        const data = { ...dto };
        if (dto.pwd)
            data.pwdEnc = (0, crypto_util_1.encryptSecret)(dto.pwd, this.key);
        if (dto.purchasedAt)
            data.purchasedAt = new Date(dto.purchasedAt);
        if (dto.expiredAt)
            data.expiredAt = new Date(dto.expiredAt);
        delete data.pwd;
        const host = await this.prisma.host.update({ where: { id }, data });
        if (userEmail)
            await this.auditLog.log(userEmail, 'update', id, JSON.stringify(dto));
        return host;
    }
    async remove(id, userEmail) {
        const host = await this.prisma.host.delete({ where: { id } });
        if (userEmail)
            await this.auditLog.log(userEmail, 'delete', id, JSON.stringify(host));
        return host;
    }
};
exports.HostsService = HostsService;
exports.HostsService = HostsService = __decorate([
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