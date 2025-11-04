import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test mail sent successfully')
  async sendTestMail() {
    await this.mailerService.sendMail({
      to: 'haokhicu1804@gmail.com',
      from: 'Support MovieBee <support@example.com>',
      subject: 'Test Mail from MovieBee',
      template: 'test',
      context: {
        name: 'Hao',
        otp: '123456',
      },
    });
  }
}
