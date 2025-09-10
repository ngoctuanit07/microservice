import { Controller, Get } from '@nestjs/common';
import { AccessLogHistoryService } from './access-log-history.service';

@Controller('access-log')
export class AccessLogHistoryController {
  constructor(private readonly history: AccessLogHistoryService) {}

  @Get('history')
  getHistory() {
    return { history: this.history.getHistory() };
  }
}
