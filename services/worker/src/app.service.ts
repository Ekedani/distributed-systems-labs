import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendNotificationCommand } from './dto/send-notification.command';
import { NotificationSentEvent } from './events/notification-sent.event';
import { lastValueFrom } from 'rxjs';
import type { ClientKafkaProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly PROCESSING_DELAY_MS: number = 1000;

  constructor(@Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafkaProxy) {}

  async sendNotification(command: SendNotificationCommand): Promise<void> {
    const startTime = Date.now();
    const request = command.payload;
    const notificationId = request.id;

    try {
      const processingDelay = this.PROCESSING_DELAY_MS;
      await this.sleep(processingDelay);

      const processingTime = Date.now() - startTime;
      const event = new NotificationSentEvent({
        id: notificationId,
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sentAt: Date.now(),
      });

      await lastValueFrom(this.kafkaClient.emit('notifications.events', event));

      this.logger.log({
        message: 'Notification sent',
        id: notificationId,
        processingTime,
      });
    } catch (error) {
      this.logger.error({
        message: 'Notification sending failed',
        id: notificationId,
        error: error.message,
      });
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
