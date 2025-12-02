import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { DispatchResponseDto } from './dto/dispatch-response.dto';
import {
  GetNotificationRequestDto,
  GetNotificationResponseDto,
} from './dto/get-notification.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('NotificationDispatcherService', 'DispatchNotification')
  async dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<DispatchResponseDto> {
    return this.appService.dispatchNotification(request);
  }

  @GrpcMethod('NotificationDispatcherService', 'GetNotification')
  async getNotification(
    request: GetNotificationRequestDto,
  ): Promise<GetNotificationResponseDto> {
    return this.appService.getNotification(request.notificationId);
  }

  @GrpcMethod('NotificationDispatcherService', 'GetAllNotifications')
  async getAllNotifications(): Promise<{ notifications: GetNotificationResponseDto[] }> {
    return this.appService.getAllNotifications();
  }
}
