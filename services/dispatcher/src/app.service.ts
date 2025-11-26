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
  private instanceId: string;

  constructor(@Inject('WORKER_PACKAGE') private client: ClientGrpc) {
    this.instanceId = process.env.INSTANCE_ID || 'dispatcher-default';
  }

  onModuleInit() {
    this.workerService = this.client.getService<WorkerService>('NotificationService');
  }

  async dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<DispatchResponseDto> {
    const startTime = Date.now();
    const notificationId = uuidv4();

    this.logger.log(
      { id: notificationId, processingTime: 0 },
      `[${this.instanceId}] Processing notification`,
    );

    try {
      const workerResponse = await this.workerService.processNotification({
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sentAt: request.sentAt,
      });

      const dispatcherDuration = Date.now() - startTime;
      this.logger.log(
        { id: notificationId, processingTime: dispatcherDuration },
        `[${this.instanceId}] Notification dispatched to worker. ` +
          `Total time: ${dispatcherDuration}ms, Worker time: ${workerResponse.processingTimeMs}ms`,
      );

      return {
        success: true,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: dispatcherDuration,
      };
    } catch (error) {
      const dispatcherDuration = Date.now() - startTime;
      this.logger.error(
        { id: notificationId, processingTime: dispatcherDuration },
        `[${this.instanceId}] Error dispatching to worker: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: dispatcherDuration,
      };
    }
  }
}
