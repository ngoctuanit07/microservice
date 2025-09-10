import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

const EMAIL_LOG_PATH = 'src/email-history.log';

@Injectable()
export class EmailLogService {
  logEmail(to: string, subject: string, text: string) {
    const entry = `${new Date().toISOString()} | ${to} | ${subject}\n${text}\n---\n`;
    fs.appendFileSync(EMAIL_LOG_PATH, entry, 'utf8');
  }

  getHistory() {
    if (!fs.existsSync(EMAIL_LOG_PATH)) return [];
    return fs.readFileSync(EMAIL_LOG_PATH, 'utf8');
  }
}
