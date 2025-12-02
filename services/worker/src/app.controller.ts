import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { SendNotificationCommand } from './dto/send-notification.command';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('notifications.commands')
  async processNotification(
    @Payload() message: SendNotificationCommand,
  ): Promise<void> {
    switch (message.commandType) {
      case 'SendNotification':
        this.appService.sendNotification(message);
        break;
      default:
        throw new Error(`Unknown command type: ${message.commandType}`);
    }
  }
}
