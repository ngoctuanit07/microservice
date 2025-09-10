import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private botToken = process.env.TELEGRAM_BOT_TOKEN;
  private chatId = process.env.TELEGRAM_CHAT_ID;

  async sendMessage(message: string) {
    if (!this.botToken || !this.chatId) return;
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    await axios.post(url, { chat_id: this.chatId, text: message });
  }
}
