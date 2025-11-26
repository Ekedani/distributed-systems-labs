import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

interface DispatchNotificationRequest {
  title: string;
  message: string;
  recipient: string;
  sent_at: number;
}

interface DispatchNotificationResponse {
  success: boolean;
  notification_id: string;
  processed_at: number;
  processing_time_ms: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('NotificationService', 'DispatchNotification')
  dispatchNotification(
    request: DispatchNotificationRequest,
  ): DispatchNotificationResponse {
    return this.appService.dispatchNotification(request);
  }
}
