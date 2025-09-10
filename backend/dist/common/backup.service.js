"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
let BackupService = class BackupService {
    async backupDatabase() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl)
            return { error: 'No DATABASE_URL' };
        const match = dbUrl.match(/mysql:\/\/(.+?):(.+?)@(.+?):(\d+)\/(.+)/);
        if (!match)
            return { error: 'Invalid DATABASE_URL format' };
        const [, user, pass, host, port, db] = match;
        const file = `backup_${Date.now()}.sql`;
        const cmd = `mysqldump -h${host} -P${port} -u${user} -p${pass} ${db} > ${file}`;
        return new Promise((resolve) => {
            (0, child_process_1.exec)(cmd, (err) => {
                if (err)
                    resolve({ error: err.message });
                else
                    resolve({ success: true, file });
            });
        });
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = __decorate([
    (0, common_1.Injectable)()
], BackupService);
//# sourceMappingURL=backup.service.js.map