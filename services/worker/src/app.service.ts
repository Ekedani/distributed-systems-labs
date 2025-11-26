import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AppService {
  processNotification(
    request: DispatchNotificationRequest,
  ): DispatchNotificationResponse {
    const startTime = Date.now();
    const notificationId = uuidv4();

    console.log(
      `[Worker] ${new Date().toISOString()} - Processing notification: ${request.title} for ${request.recipient}`,
    );

    const processingDelay = Math.random() * 100
    const endTime = startTime + processingDelay;
    const processingTime = Date.now() - startTime;

    console.log(
      `[Worker] ${new Date().toISOString()} - Notification processed in ${processingTime}ms`,
    );

    return {
      success: true,
      notification_id: notificationId,
      processed_at: Date.now(),
      processing_time_ms: processingTime,
    };
  }
}
