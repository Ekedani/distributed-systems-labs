import { Injectable, Inject } from '@nestjs/common';
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

interface WorkerService {
  processNotification(
    request: DispatchNotificationRequest,
  ): Promise<DispatchNotificationResponse>;
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
    request: DispatchNotificationRequest,
  ): DispatchNotificationResponse {
    const startTime = Date.now();
    const notificationId = uuidv4();

    console.log(
      `[Dispatcher] ${new Date().toISOString()} - Processing notification (ID: ${notificationId})`,
    );

    // Synchronous call to worker (in real async scenarios, this would be awaited)
    // For now, simulating the worker processing
    this.workerService
      .processNotification({
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sent_at: request.sent_at,
      })
      .then((workerResponse) => {
        const dispatcherDuration = Date.now() - startTime;
        console.log(
          `[Dispatcher] ${new Date().toISOString()} - Notification dispatched to worker. ` +
            `Total time: ${dispatcherDuration}ms, Worker time: ${workerResponse.processing_time_ms}ms`,
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
      notification_id: notificationId,
      processed_at: Date.now(),
      processing_time_ms: processingTime,
    };
  }
}
