import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello(): { title: string; message: string; route: string } {
    return this.appService.getHello();
  }

  @Get('info')
  @Render('index')
  getInfo(): { title: string; message: string; route: string } {
    return this.appService.getInfo();
  }
}
