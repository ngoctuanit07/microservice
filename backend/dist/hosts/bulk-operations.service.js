"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const XLSX = __importStar(require("xlsx"));
let BulkOperationsService = class BulkOperationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.operations = new Map();
    }
    async bulkUpdateHosts(hostIds, updates, userId) {
        const operationId = this.generateOperationId();
        this.setOperationStatus(operationId, {
            status: 'running',
            progress: 0,
            message: 'Starting bulk update...'
        });
        try {
            let updatedCount = 0;
            const total = hostIds.length;
            for (const hostId of hostIds) {
                const host = await this.prisma.host.findFirst({
                    where: { id: hostId, userId }
                });
                if (host) {
                    await this.prisma.host.update({
                        where: { id: hostId },
                        data: {
                            ...updates,
                            updatedAt: new Date()
                        }
                    });
                    updatedCount++;
                }
                const progress = Math.round((updatedCount / total) * 100);
                this.setOperationStatus(operationId, {
                    status: 'running',
                    progress,
                    message: `Updated ${updatedCount} of ${total} hosts`
                });
            }
            this.setOperationStatus(operationId, {
                status: 'completed',
                progress: 100,
                message: `Successfully updated ${updatedCount} hosts`,
                result: { updatedCount, total }
            });
            return { operationId, updatedCount };
        }
        catch (error) {
            this.setOperationStatus(operationId, {
                status: 'failed',
                progress: 0,
                message: 'Failed to update hosts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    async bulkDeleteHosts(hostIds, userId) {
        const operationId = this.generateOperationId();
        this.setOperationStatus(operationId, {
            status: 'running',
            progress: 0,
            message: 'Starting bulk delete...'
        });
        try {
            const result = await this.prisma.host.deleteMany({
                where: {
                    id: { in: hostIds },
                    userId
                }
            });
            this.setOperationStatus(operationId, {
                status: 'completed',
                progress: 100,
                message: `Successfully deleted ${result.count} hosts`,
                result: { deletedCount: result.count }
            });
            return { operationId, deletedCount: result.count };
        }
        catch (error) {
            this.setOperationStatus(operationId, {
                status: 'failed',
                progress: 0,
                message: 'Failed to delete hosts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    async exportHosts(filters, userId) {
        const operationId = this.generateOperationId();
        this.setOperationStatus(operationId, {
            status: 'running',
            progress: 50,
            message: 'Exporting hosts data...'
        });
        try {
            const hosts = await this.prisma.host.findMany({
                where: {
                    userId,
                    ...this.buildFilters(filters)
                },
                select: {
                    id: true,
                    ip: true,
                    port: true,
                    uid: true,
                    purchasedAt: true,
                    expiredAt: true,
                    notes: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            const ws = XLSX.utils.json_to_sheet(hosts.map(host => ({
                ID: host.id,
                'IP Address': host.ip,
                'Port': host.port,
                'Username': host.uid,
                'Purchased Date': host.purchasedAt.toISOString().split('T')[0],
                'Expiry Date': host.expiredAt.toISOString().split('T')[0],
                'Status': host.status,
                'Notes': host.notes || '',
                'Created': host.createdAt.toISOString().split('T')[0]
            })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hosts');
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            this.setOperationStatus(operationId, {
                status: 'completed',
                progress: 100,
                message: `Successfully exported ${hosts.length} hosts`,
                result: {
                    fileName: `hosts-export-${new Date().toISOString().split('T')[0]}.xlsx`,
                    data: buffer.toString('base64'),
                    count: hosts.length
                }
            });
            return { operationId, count: hosts.length };
        }
        catch (error) {
            this.setOperationStatus(operationId, {
                status: 'failed',
                progress: 0,
                message: 'Failed to export hosts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    async importHosts(hostsData, userId) {
        const operationId = this.generateOperationId();
        this.setOperationStatus(operationId, {
            status: 'running',
            progress: 0,
            message: 'Starting import...'
        });
        try {
            let importedCount = 0;
            let skippedCount = 0;
            const total = hostsData.length;
            for (const hostData of hostsData) {
                try {
                    if (!hostData.ip || !hostData.port) {
                        skippedCount++;
                        continue;
                    }
                    const existingHost = await this.prisma.host.findFirst({
                        where: {
                            ip: hostData.ip,
                            port: parseInt(hostData.port),
                            userId
                        }
                    });
                    if (existingHost) {
                        skippedCount++;
                        continue;
                    }
                    await this.prisma.host.create({
                        data: {
                            ip: hostData.ip,
                            port: parseInt(hostData.port),
                            uid: hostData.uid || 'imported',
                            pwdEnc: hostData.password || 'encrypted-password',
                            purchasedAt: hostData.purchasedAt ? new Date(hostData.purchasedAt) : new Date(),
                            expiredAt: hostData.expiredAt ? new Date(hostData.expiredAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                            notes: hostData.notes || 'Imported host',
                            status: hostData.status || 'ACTIVE',
                            userId
                        }
                    });
                    importedCount++;
                }
                catch (hostError) {
                    skippedCount++;
                    console.error('Error importing host:', hostData, hostError);
                }
                const progress = Math.round(((importedCount + skippedCount) / total) * 100);
                this.setOperationStatus(operationId, {
                    status: 'running',
                    progress,
                    message: `Imported ${importedCount}, skipped ${skippedCount} of ${total} hosts`
                });
            }
            this.setOperationStatus(operationId, {
                status: 'completed',
                progress: 100,
                message: `Import completed: ${importedCount} imported, ${skippedCount} skipped`,
                result: { importedCount, skippedCount, total }
            });
            return { operationId, importedCount, skippedCount };
        }
        catch (error) {
            this.setOperationStatus(operationId, {
                status: 'failed',
                progress: 0,
                message: 'Failed to import hosts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    getOperationStatus(operationId) {
        return this.operations.get(operationId) || null;
    }
    generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    setOperationStatus(operationId, status) {
        const existing = this.operations.get(operationId) || {
            id: operationId,
            status: 'pending',
            progress: 0,
            message: ''
        };
        this.operations.set(operationId, {
            ...existing,
            ...status,
            id: operationId
        });
        if (status.status === 'completed' || status.status === 'failed') {
            setTimeout(() => {
                this.operations.delete(operationId);
            }, 60 * 60 * 1000);
        }
    }
    buildFilters(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.expiringIn) {
            const days = parseInt(filters.expiringIn);
            where.expiredAt = {
                lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
                gt: new Date()
            };
        }
        if (filters.search) {
            where.OR = [
                { ip: { contains: filters.search } },
                { notes: { contains: filters.search } },
                { uid: { contains: filters.search } }
            ];
        }
        return where;
    }
};
exports.BulkOperationsService = BulkOperationsService;
exports.BulkOperationsService = BulkOperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BulkOperationsService);
//# sourceMappingURL=bulk-operations.service.js.map