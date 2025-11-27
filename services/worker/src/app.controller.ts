import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(['notifications.high', 'notifications.low'])
  async processHighPriority(
    @Payload() message: ProcessNotificationDto,
  ): Promise<ProcessResponseDto> {
    return this.appService.processNotification(message);
  }
}
