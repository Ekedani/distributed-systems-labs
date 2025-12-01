import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('notifications.events')
  async handleEvent(@Payload() message: any): Promise<void> {
    const eventType = message?.eventType || message?.type;

    this.logger.log({
      message: 'Received event',
      eventType,
      notificationId: message?.payload?.id || message?.id,
    });

    try {
      switch (eventType) {
        case 'NotificationCreated':
          await this.appService.handleNotificationCreated(message);
          break;
        case 'NotificationSent':
          await this.appService.handleNotificationSent(message);
          break;
        default:
          this.logger.warn(`Unknown event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error({
        message: 'Error handling event',
        eventType,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
