import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class SecurityHealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const checks: any = {};
    // Kiểm tra biến môi trường bảo mật
    checks.jwtSecret = !!process.env.JWT_SECRET;
    checks.hostSecretKey = !!process.env.HOST_SECRET_KEY;
    checks.dbUrl = !!process.env.DATABASE_URL;
    // Kiểm tra trạng thái DB
    try {
      await this.prisma.$connect();
      checks.db = 'ok';
    } catch {
      checks.db = 'fail';
    }
    // Kiểm tra các package bảo mật phổ biến
    checks.helmet = !!require.resolve('helmet');
    checks.compression = !!require.resolve('compression');
    // Kiểm tra lỗ hổng phổ biến (demo)
    checks.cors = !!process.env.CORS_ORIGINS;
    return checks;
  }
}
