import { Controller, Get, Patch, Body, Inject, Req } from '@nestjs/common';
import * as fs from 'fs';
import { ConfigHistoryService } from './config-history.service';

@Controller('config')
export class ConfigController {
  constructor(@Inject(ConfigHistoryService) private history: ConfigHistoryService) {}

  @Get()
  getConfig() {
    const envPath = 'src/.env';
    if (!fs.existsSync(envPath)) return { error: '.env not found' };
    const env = fs.readFileSync(envPath, 'utf8');
    return { env };
  }

  @Get('history')
  getHistory() {
    return { history: this.history.getHistory() };
  }

  @Patch()
  updateConfig(@Body() body: { env: string }, @Req() req: any) {
    const envPath = 'src/.env';
    fs.writeFileSync(envPath, body.env, 'utf8');
    const user = req.user?.email || 'system';
    this.history.logChange(user, body.env);
    return { success: true };
  }
}
