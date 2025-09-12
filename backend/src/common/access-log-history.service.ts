import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const ACCESS_LOG_DIR = 'logs';
const ACCESS_LOG_PATH = path.join(ACCESS_LOG_DIR, 'access-history.log');

@Injectable()
export class AccessLogHistoryService {
  private readonly logger = new Logger(AccessLogHistoryService.name);

  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(ACCESS_LOG_DIR)) {
        fs.mkdirSync(ACCESS_LOG_DIR, { recursive: true });
        this.logger.log(`Created log directory: ${ACCESS_LOG_DIR}`);
      }
    } catch (error: any) {
      this.logger.error(`Error creating log directory: ${error.message || String(error)}`);
    }
  }

  logAccess(entry: string) {
    try {
      fs.appendFileSync(ACCESS_LOG_PATH, entry + '\n', 'utf8');
    } catch (error: any) {
      this.logger.error(`Error logging access: ${error.message || String(error)}`);
    }
  }

  getHistory() {
    try {
      if (!fs.existsSync(ACCESS_LOG_PATH)) return [];
      return fs.readFileSync(ACCESS_LOG_PATH, 'utf8');
    } catch (error: any) {
      this.logger.error(`Error reading access history: ${error.message || String(error)}`);
      return [];
    }
  }
}
