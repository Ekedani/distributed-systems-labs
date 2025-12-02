import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientKafkaProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { SendNotificationCommand } from './dto/notification.commands';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_PRODUCER') private kafkaClient: ClientKafkaProxy,
  ) {}

  async handleNotificationCreated(event: any): Promise<void> {
    const { id, title, message, recipient, sentAt } = event.payload;

    this.logger.log({
      message: 'Processing NotificationCreated event',
      notificationId: id,
    });

    try {
      const command = new SendNotificationCommand({
        id,
        title,
        message,
        recipient,
        sentAt,
      });

      this.logger.log({
        message: 'Sending SendNotification command',
        notificationId: id,
      });

      await lastValueFrom(
        this.kafkaClient.emit('notifications.commands', command),
      );

      this.logger.log({
        message: 'SendNotification command sent successfully',
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
