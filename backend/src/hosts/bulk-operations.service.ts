import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

interface OperationStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: any;
  error?: string;
}

@Injectable()
export class BulkOperationsService {
  private operations = new Map<string, OperationStatus>();

  constructor(private prisma: PrismaService) {}

  async bulkUpdateHosts(hostIds: number[], updates: any, userId: number) {
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
        // Verify ownership
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

        // Update progress
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
    } catch (error) {
      this.setOperationStatus(operationId, {
        status: 'failed',
        progress: 0,
        message: 'Failed to update hosts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async bulkDeleteHosts(hostIds: number[], userId: number) {
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
    } catch (error) {
      this.setOperationStatus(operationId, {
        status: 'failed',
        progress: 0,
        message: 'Failed to delete hosts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async exportHosts(filters: any, userId: number) {
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

      // Create Excel workbook
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
    } catch (error) {
      this.setOperationStatus(operationId, {
        status: 'failed',
        progress: 0,
        message: 'Failed to export hosts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async importHosts(hostsData: any[], userId: number) {
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
          // Validate required fields
          if (!hostData.ip || !hostData.port) {
            skippedCount++;
            continue;
          }

          // Check if host already exists
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

          // Create new host
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
        } catch (hostError) {
          skippedCount++;
          console.error('Error importing host:', hostData, hostError);
        }

        // Update progress
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
    } catch (error) {
      this.setOperationStatus(operationId, {
        status: 'failed',
        progress: 0,
        message: 'Failed to import hosts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  getOperationStatus(operationId: string): OperationStatus | null {
    return this.operations.get(operationId) || null;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setOperationStatus(operationId: string, status: Partial<OperationStatus>) {
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

    // Clean up completed operations after 1 hour
    if (status.status === 'completed' || status.status === 'failed') {
      setTimeout(() => {
        this.operations.delete(operationId);
      }, 60 * 60 * 1000);
    }
  }

  private buildFilters(filters: any) {
    const where: any = {};

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
}