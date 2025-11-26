import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

interface NotificationService {
  dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<NotificationResponseDto>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private notificationService: NotificationService;

  constructor(@Inject('DISPATCHER_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.notificationService =
      this.client.getService<NotificationService>('NotificationService');
  }

  async createNotification(
    title: string,
    message: string,
    recipient: string,
  ): Promise<NotificationResponseDto> {
    const startTime = Date.now();
    const sentAt = startTime;

    const response = await this.notificationService.dispatchNotification({
      title,
      message,
      recipient,
      sentAt: sentAt,
    });

    return {
      success: response.success,
      notificationId: response.notificationId,
      processedAt: response.processedAt,
    };
  }
}
