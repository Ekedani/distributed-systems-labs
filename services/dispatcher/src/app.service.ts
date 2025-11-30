import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ClientKafkaProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { DispatchResponseDto } from './dto/dispatch-response.dto';
import { NotificationCreatedEvent } from './events/notification-created.event';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_PRODUCER') private client: ClientKafkaProxy,
  ) {}

  async dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<DispatchResponseDto> {
    const startTime = Date.now();
    const notificationId = uuidv4();

    try {
      const event = new NotificationCreatedEvent({
        id: notificationId,
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sentAt: Date.now(),
      });

      this.client.emit('notifications.events', event);
      const dispatcherDuration = Date.now() - startTime;

      this.logger.log({
        message: 'Notification dispatched',
        id: event.payload.id,
        processingTime: dispatcherDuration,
      });

      return { notificationId };
    } catch (error) {
      this.logger.error({
        message: 'Notification dispatch failed',
        id: notificationId,
        error: error.message,
      });
      throw error;
    }
  }
}
