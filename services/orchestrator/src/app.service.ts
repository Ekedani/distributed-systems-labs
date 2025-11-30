import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientKafkaProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject('KAFKA_PRODUCER') private kafkaClient: ClientKafkaProxy) {}

  async handleNotificationCreated(event: any): Promise<void> {
    const { id, title, message, recipient, sentAt, priority } = event.payload;

    this.logger.log({
      message: 'Processing NotificationCreated event',
      notificationId: id,
      priority: priority || 'normal',
    });

    try {
      const dispatchCommand = {
        id,
        title,
        message,
        recipient,
        sentAt,
        priority: priority || 'normal',
      };

      this.logger.log({
        message: 'Sending dispatch command',
        notificationId: id,
      });

      await lastValueFrom(this.kafkaClient.send('notifications.commands', dispatchCommand));

      this.logger.log({
        message: 'Dispatch command sent successfully',
        notificationId: id,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to process NotificationCreated event',
        notificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async handleNotificationSent(event: any): Promise<void> {
    const { id, recipient } = event.payload || event;

    this.logger.log({
      message: 'Processing NotificationSent event',
      notificationId: id,
      recipient,
    });
  }
}
