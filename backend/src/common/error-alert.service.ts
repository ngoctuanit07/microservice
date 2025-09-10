import { Injectable, Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { SlackService } from './slack.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class ErrorAlertService {
  private logger = new Logger('ErrorAlert');

  constructor(
    private mail: MailService,
    private slack: SlackService,
    private telegram: TelegramService,
  ) {}

  async notifyError(error: string) {
    this.logger.error(error);
    await this.mail.sendMail('admin@example.com', 'System Error', error);
    await this.slack.sendMessage(`System Error: ${error}`);
    await this.telegram.sendMessage(`System Error: ${error}`);
  }
}
