import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

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

interface NotificationService {
  dispatchNotification(
    request: DispatchNotificationRequest,
  ): Promise<DispatchNotificationResponse>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private dispatcherService: NotificationService;

  constructor(@Inject('DISPATCHER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.dispatcherService =
      this.client.getService<NotificationService>('NotificationService');
    console.log('[Gateway] Dispatcher gRPC client initialized');
  }

  async createNotification(title: string, message: string, recipient: string): Promise<any> {
    const startTime = Date.now();
    const sentAt = startTime;
    const notificationId = uuidv4();

    console.log(
      `[Gateway] ${new Date().toISOString()} - Sending notification (ID: ${notificationId})`,
    );

    try {
      const response = await this.dispatcherService.dispatchNotification({
        title,
        message,
        recipient,
        sent_at: sentAt,
      });

      const gatewayDuration = Date.now() - startTime;

      console.log(
        `[Gateway] ${new Date().toISOString()} - Notification processed. ` +
          `Total time: ${gatewayDuration}ms, Dispatcher time: ${response.processing_time_ms}ms`,
      );

      return {
        success: response.success,
        notification_id: response.notification_id,
        gateway_total_time_ms: gatewayDuration,
        dispatcher_processing_time_ms: response.processing_time_ms,
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
