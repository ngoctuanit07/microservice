import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AccessLogHistoryService } from './access-log-history.service';

@Injectable()
export class AccessLogMiddleware implements NestMiddleware {
  private logger = new Logger('AccessLog');
  constructor(@Inject(AccessLogHistoryService) private history: AccessLogHistoryService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    const user = (req.user as any)?.email || 'anonymous';
    const that = this; // Store reference to 'this'
    res.on('finish', function() {
      const logEntry = `${new Date().toISOString()} | ${method} ${url} by ${user} - ${res.statusCode}`;
      that.logger.log(logEntry);
      that.history.logAccess(logEntry);
    });
    next();
  }
}
