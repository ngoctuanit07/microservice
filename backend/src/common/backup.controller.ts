import { Controller, Post, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('backup')
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Post()
  async backupDb() {
    return this.backup.backupDatabase();
  }
}
