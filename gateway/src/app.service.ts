import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

interface NotificationService {
  dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<NotificationResponseDto>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private dispatcherService: NotificationService;

  constructor(@Inject('DISPATCHER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.dispatcherService =
      this.client.getService<NotificationService>('NotificationService');
  }

  async createNotification(
    title: string,
    message: string,
    recipient: string,
  ): Promise<NotificationResponseDto> {
    const startTime = Date.now();
    const sentAt = startTime;
    const notificationId = uuidv4();

    try {
      const response = await this.dispatcherService.dispatchNotification({
        title,
        message,
        recipient,
        sentAt: sentAt,
      });

      const gatewayDuration = Date.now() - startTime;

      return {
        success: response.success,
        notificationId: response.notificationId,
        processingTimeMs: response.processingTimeMs,
        gatewayTotalTimeMs: gatewayDuration,
        dispatcherProcessingTimeMs: response.processingTimeMs,
      };
    } catch (error) {
      console.error(
        `[Gateway] ${new Date().toISOString()} - Error dispatching notification:`,
        error.message,
      );
      throw error;
    }
  }
}
