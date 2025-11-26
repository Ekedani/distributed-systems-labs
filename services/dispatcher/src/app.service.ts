import { Injectable, Inject } from '@nestjs/common';
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
  private workerService: WorkerService;

  constructor(@Inject('WORKER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.workerService = this.client.getService<WorkerService>('NotificationService');
    console.log('[Dispatcher] Worker gRPC client initialized');
  }

  dispatchNotification(
    request: DispatchNotificationDto,
  ): DispatchResponseDto {
    const startTime = Date.now();
    const notificationId = uuidv4();

    this.workerService
      .processNotification({
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sentAt: request.sentAt,
      })
      .then((workerResponse) => {
        const dispatcherDuration = Date.now() - startTime;
        console.log(
          `[Dispatcher] ${new Date().toISOString()} - Notification dispatched to worker. ` +
            `Total time: ${dispatcherDuration}ms, Worker time: ${workerResponse.processingTimeMs}ms`,
        );
      })
      .catch((error) => {
        console.error(
          `[Dispatcher] ${new Date().toISOString()} - Error calling worker:`,
          error.message,
        );
      });

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      notificationId: notificationId,
      processedAt: Date.now(),
      processingTimeMs: processingTime,
    };
  }
}
