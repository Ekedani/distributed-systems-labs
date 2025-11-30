import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientKafkaProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { DispatchResponseDto } from './dto/dispatch-response.dto';
import { ProcessNotificationDto } from './dto/process-notification.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject('KAFKA_PRODUCER') private kafkaClient: ClientKafkaProxy) {}


  async dispatchNotification(
    request: DispatchNotificationDto,
  ): Promise<DispatchResponseDto> {
    const startTime = Date.now();
    const notificationId = uuidv4();

    try {
      const processNotification: ProcessNotificationDto = {
        id: notificationId,
        title: request.title,
        message: request.message,
        recipient: request.recipient,
        sentAt: request.sentAt,
      };

      this.kafkaClient.emit('notifications.events', processNotification);
      const dispatcherDuration = Date.now() - startTime;

      this.logger.log({
        message: 'Notification dispatched',
        id: notificationId,
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
