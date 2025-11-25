import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('notifications')
  createNotification(): string {
    return this.appService.createNotification();
  }
}
