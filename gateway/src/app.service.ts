import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AppService.name);
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
    const notificationId = uuidv4();

    try {
      const response = await this.notificationService.dispatchNotification({
        title,
        message,
        recipient,
        sentAt: sentAt,
      });

      const gatewayDuration = Date.now() - startTime;

      this.logger.log(
        { id: notificationId, processingTime: gatewayDuration },
        `Notification processed. Gateway time: ${gatewayDuration}ms, ` +
        `Dispatcher time: ${response.processingTimeMs}ms`,
      );

      return {
        success: response.success,
        notificationId: response.notificationId,
        processingTimeMs: response.processingTimeMs,
        gatewayTotalTimeMs: gatewayDuration,
        dispatcherProcessingTimeMs: response.processingTimeMs,
        processedAt: response.processedAt,
      };
    } catch (error) {
      const gatewayDuration = Date.now() - startTime;
      this.logger.error(
        { id: notificationId, processingTime: gatewayDuration },
        `Error dispatching notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
