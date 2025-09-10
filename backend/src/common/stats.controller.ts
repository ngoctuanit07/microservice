import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SimpleCacheService } from './simple-cache.service';

@Controller('stats')
export class StatsController {
  constructor(
    private prisma: PrismaService,
    @Inject(SimpleCacheService) private cache: SimpleCacheService,
  ) {}

  @Get()
  async getStats() {
    const cacheKey = 'stats';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const [userCount, hostCount, expiringSoon, topExpiringHosts, topUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.host.count(),
      this.prisma.host.count({
        where: {
          expiredAt: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.host.findMany({
        where: {
          expiredAt: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { expiredAt: 'asc' },
        take: 5,
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: {
          hosts: {
            _count: 'desc',
          },
        },
        include: {
          _count: {
            select: { hosts: true },
          },
        },
      }),
    ]);
    const result = {
      userCount,
      hostCount,
      expiringSoon,
      topExpiringHosts,
      topUsers,
    };
    this.cache.set(cacheKey, result, 60 * 1000); // cache 1 phút
    return result;
  }
}
