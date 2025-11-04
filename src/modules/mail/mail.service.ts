import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendTestEmail(email: string, context: object) {
    await this.mailService.sendMail({
      to: email,
      from: 'Support MovieBee',
      subject: 'Test Email',
      template: 'test',
      context: context,
    });
  }

  async sendOtpEmail(email: string, context: object) {
    await this.mailService.sendMail({
      to: email,
      from: 'Support MovieBee',
      subject: 'Xác nhận Email - MovieBee',
      template: 'otp',
      context: context,
    });
  }
}
