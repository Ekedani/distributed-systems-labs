import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { DispatchResponseDto } from './dto/dispatch-response.dto';

interface WorkerService {
  processNotification(
    request: DispatchNotificationDto,
  ): Promise<DispatchResponseDto>;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private workerService: WorkerService;

  constructor(@Inject('WORKER_PACKAGE') private client: ClientGrpc) {
  }

  onModuleInit() {
    this.workerService = this.client.getService<WorkerService>(
      'NotificationService',
    );
  }

  async dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<DispatchResponseDto> {
    const startTime = Date.now();
    const notificationId = uuidv4();

    try {
      await this.workerService.processNotification({
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sentAt: request.sentAt,
      });

      const dispatcherDuration = Date.now() - startTime;
      this.logger.log({
        message: 'Notification processed',
        id: notificationId,
        processingTime: dispatcherDuration,
      });

      return {
        success: true,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: dispatcherDuration,
      };
    } catch (error) {
      const dispatcherDuration = Date.now() - startTime;
      this.logger.error({
        message: 'Notification processing failed',
        id: notificationId,
        error: error.message,
      });

      return {
        success: false,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: dispatcherDuration,
      };
    }
  }
}
