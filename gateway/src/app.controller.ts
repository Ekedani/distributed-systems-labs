import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('notifications')
  async createNotification(
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.appService.createNotification(
      dto.title,
      dto.message,
      dto.recipient,
    );
  }
}
