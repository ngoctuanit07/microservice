import { Controller, Get, Post } from '@nestjs/common';
import { exec } from 'child_process';

@Controller('dependency')
export class DependencyController {
  @Get('outdated')
  async checkOutdated() {
    return new Promise((resolve) => {
      exec('npm outdated --json', { cwd: process.cwd() }, (err, stdout) => {
        if (err) resolve({ error: err.message });
        else resolve({ outdated: JSON.parse(stdout || '{}') });
      });
    });
  }

  @Post('update')
  async updateAll() {
    return new Promise((resolve) => {
      exec('npm update', { cwd: process.cwd() }, (err, stdout) => {
        if (err) resolve({ error: err.message });
        else resolve({ updated: true, log: stdout });
      });
    });
  }
}
