import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

interface CreateNotificationDto {
  title: string;
  message: string;
  recipient: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('notifications')
  async createNotification(
    @Body() dto: CreateNotificationDto,
  ): Promise<any> {
    return this.appService.createNotification(
      dto.title,
      dto.message,
      dto.recipient,
    );
  }
}
