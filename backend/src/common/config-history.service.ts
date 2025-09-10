import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

const LOG_PATH = 'src/config-history.log';

@Injectable()
export class ConfigHistoryService {
  logChange(user: string, newEnv: string) {
    const entry = `${new Date().toISOString()} | ${user}\n${newEnv}\n---\n`;
    fs.appendFileSync(LOG_PATH, entry, 'utf8');
  }

  getHistory() {
    if (!fs.existsSync(LOG_PATH)) return [];
    return fs.readFileSync(LOG_PATH, 'utf8');
  }
}
