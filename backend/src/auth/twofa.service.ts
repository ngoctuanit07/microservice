import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { MailService } from '../common/mail.service';

const OTP_EXPIRY = 5 * 60 * 1000; // 5 phút

@Injectable()
export class TwoFAService {
  private otps: Map<string, { otp: string; expires: number }> = new Map();

  constructor(private mail: MailService) {}

  async sendOtp(email: string) {
    const otp = String(randomInt(100000, 999999));
    const expires = Date.now() + OTP_EXPIRY;
    this.otps.set(email, { otp, expires });
    await this.mail.sendMail(email, 'Your OTP code', `Your OTP: ${otp}`);
    return { message: 'OTP sent' };
  }

  async verifyOtp(email: string, otp: string) {
    const entry = this.otps.get(email);
    if (!entry || entry.expires < Date.now() || entry.otp !== otp) {
      throw new Error('Invalid or expired OTP');
    }
    this.otps.delete(email);
    return { message: 'OTP verified' };
  }
}
