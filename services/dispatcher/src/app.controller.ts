import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { DispatchResponseDto } from './dto/dispatch-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('NotificationService', 'DispatchNotification')
  dispatchNotification(
    request: DispatchNotificationDto,
  ): DispatchResponseDto {
    return this.appService.dispatchNotification(request);
  }
}
