import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

const ACCESS_LOG_PATH = 'src/access-history.log';

@Injectable()
export class AccessLogHistoryService {
  logAccess(entry: string) {
    fs.appendFileSync(ACCESS_LOG_PATH, entry + '\n', 'utf8');
  }

  getHistory() {
    if (!fs.existsSync(ACCESS_LOG_PATH)) return [];
    return fs.readFileSync(ACCESS_LOG_PATH, 'utf8');
  }
}
