import { Controller, Get } from '@nestjs/common';
import { exec } from 'child_process';

@Controller('security')
export class SecurityScanController {
  @Get('audit')
  async auditPackages() {
    return new Promise((resolve) => {
      exec('npm audit --json', { cwd: process.cwd() }, (err, stdout) => {
        if (err) resolve({ error: err.message });
        else resolve({ audit: JSON.parse(stdout || '{}') });
      });
    });
  }

  @Get('endpoints')
  async checkEndpoints() {
    // Demo kiểm tra CORS, headers, cấu hình
    const cors = !!process.env.CORS_ORIGINS;
    const helmet = !!require.resolve('helmet');
    const compression = !!require.resolve('compression');
    return { cors, helmet, compression };
  }
}
