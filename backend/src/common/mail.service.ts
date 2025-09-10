import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Inject } from '@nestjs/common';
import { EmailLogService } from './email-log.service';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  constructor(@Inject(EmailLogService) private emailLog: EmailLogService) {}

  async sendMail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
    this.emailLog.logEmail(to, subject, text);
  }

  async sendBulkMail(recipients: string[], subject: string, text: string) {
    for (const to of recipients) {
      await this.sendMail(to, subject, text);
    }
    return { sent: recipients.length };
  }
}
