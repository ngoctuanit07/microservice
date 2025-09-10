import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class BackupService {
  async backupDatabase() {
    // Chạy lệnh mysqldump, cần cấu hình đúng quyền và đường dẫn
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return { error: 'No DATABASE_URL' };
    // Giả sử url dạng mysql://user:pass@host:port/dbname
    const match = dbUrl.match(/mysql:\/\/(.+?):(.+?)@(.+?):(\d+)\/(.+)/);
    if (!match) return { error: 'Invalid DATABASE_URL format' };
    const [, user, pass, host, port, db] = match;
    const file = `backup_${Date.now()}.sql`;
    const cmd = `mysqldump -h${host} -P${port} -u${user} -p${pass} ${db} > ${file}`;
    return new Promise((resolve) => {
      exec(cmd, (err) => {
        if (err) resolve({ error: err.message });
        else resolve({ success: true, file });
      });
    });
  }
}
