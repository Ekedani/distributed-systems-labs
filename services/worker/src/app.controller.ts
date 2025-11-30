import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { NotificationCommandDto } from './dto/process-notification.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('notifications.commands')
  async processNotification(
    @Payload() message: NotificationCommandDto,
  ): Promise<void> {
    switch (message.type) {
      case 'SendNotification':
        this.appService.sendNotification(message.payload);
      default:
        throw new Error(`Unknown command type: ${message.type}`);
    }
  }
}
