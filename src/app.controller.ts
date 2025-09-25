import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('home') // sử dụng decorator @Render để render view 'home'
  getHello() {
    // return 'this.appService.getHello()';
  }
}
