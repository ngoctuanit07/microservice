import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SlackService {
  private webhookUrl = process.env.SLACK_WEBHOOK_URL;

  async sendMessage(message: string) {
    if (!this.webhookUrl) return;
    await axios.post(this.webhookUrl, { text: message });
  }
}
