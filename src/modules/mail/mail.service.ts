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

  async sendSuccessUploadMovie(email: string, context: object) {
    await this.mailService.sendMail({
      to: email,
      from: 'Support MovieBee',
      subject: 'Upload Movie Thành Công - MovieBee',
      template: 'upload-movie-success',
      context: context,
    });
  }
}
