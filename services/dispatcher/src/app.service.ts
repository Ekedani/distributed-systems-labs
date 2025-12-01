import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ClientKafkaProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { DispatchResponseDto } from './dto/dispatch-response.dto';
import { GetNotificationResponseDto } from './dto/get-notification.dto';
import { NotificationCreatedEvent } from './events/notification-created.event';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_CLIENT') private clientKafka: ClientKafkaProxy,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
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

      await lastValueFrom(this.clientKafka.emit('notifications.events', event));
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

  async getNotification(notificationId: string): Promise<GetNotificationResponseDto> {
    this.logger.log({
      message: 'Fetching notification',
      notificationId,
    });

    try {
      const notification = await this.notificationModel.findOne({ id: notificationId }).exec();

      if (!notification) {
        this.logger.warn({
          message: 'Notification not found',
          notificationId,
        });
        throw new NotFoundException(`Notification with ID ${notificationId} not found`);
      }

      this.logger.log({
        message: 'Notification retrieved successfully',
        notificationId,
      });

      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        recipient: notification.recipient,
        sentAt: notification.sentAt,
        status: notification.status,
        createdAt: notification.createdAt?.toISOString(),
        updatedAt: notification.updatedAt?.toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error({
        message: 'Failed to retrieve notification',
        notificationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
