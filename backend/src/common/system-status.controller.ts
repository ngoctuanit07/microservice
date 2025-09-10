import { Controller, Get } from '@nestjs/common';

let startTime = Date.now();
let requestCount = 0;

@Controller('system')
export class SystemStatusController {
  @Get('status')
  getStatus() {
    requestCount++;
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    return {
      uptime,
      memory,
      cpu,
      requestCount,
      timestamp: new Date().toISOString(),
    };
  }
}
