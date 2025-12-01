import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import {
  NotificationCreatedEvent,
  NotificationSentEvent,
} from './dto/notification.events';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async handleNotificationCreated(
    event: NotificationCreatedEvent,
  ): Promise<void> {
    const { id, title, message, recipient, sentAt } = event.payload;

    this.logger.log({
      message: 'Materializing NotificationCreated event',
      notificationId: id,
    });

    try {
      await this.notificationModel.findOneAndUpdate(
        { id },
        {
          id,
          title,
          message,
          recipient,
          sentAt,
          status: 'created',
        },
        { upsert: true, new: true },
      );

      this.logger.log({
        message: 'NotificationCreated event materialized successfully',
        notificationId: id,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to materialize NotificationCreated event',
        notificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async handleNotificationSent(event: NotificationSentEvent): Promise<void> {
    const { id } = event.payload;

    this.logger.log({
      message: 'Materializing NotificationSent event',
      notificationId: id,
    });

    try {
      const result = await this.notificationModel.findOneAndUpdate(
        { id },
        { status: 'sent' },
        { new: true },
      );

      if (!result) {
        this.logger.warn({
          message: 'Notification not found for NotificationSent event',
          notificationId: id,
        });
        return;
      }

      this.logger.log({
        message: 'NotificationSent event materialized successfully',
        notificationId: id,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to materialize NotificationSent event',
        notificationId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
