import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import * as net from 'net';

@Controller('hosts')
export class HostsCheckController {
  @Get(':id/check')
  async checkHost(@Param('id', ParseIntPipe) id: number) {
    // Giả sử lấy thông tin host từ DB, ở đây demo hardcode
    // Thực tế nên inject HostsService và lấy host theo id
    const host = { ip: '8.8.8.8', port: 53 };
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let status = 'offline';
      socket.setTimeout(3000);
      socket.on('connect', () => {
        status = 'online';
        socket.destroy();
      });
      socket.on('error', () => {
        status = 'offline';
      });
      socket.on('timeout', () => {
        status = 'offline';
        socket.destroy();
      });
      socket.on('close', () => {
        resolve({ status });
      });
      socket.connect(host.port, host.ip);
    });
  }
}
