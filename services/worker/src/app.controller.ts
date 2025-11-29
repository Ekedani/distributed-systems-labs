import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, KafkaContext, Ctx } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private consumer: any;

  constructor(private readonly appService: AppService) {}

  @MessagePattern('notifications.high')
  async processHighPriority(
    @Payload() message: ProcessNotificationDto,
    @Ctx() context: KafkaContext,
  ): Promise<ProcessResponseDto> {
    if (!this.consumer) {
      this.consumer = context.getConsumer();
    }

    await this.consumer.pause([{ topic: 'notifications.normal' }]);
    this.logger.debug('Paused notifications.normal topic');

    const result = await this.appService.processNotification(message);
    const highLag = await this.appService.checkHighPriorityLag();

    if (highLag === 0) {
      await this.consumer.resume([{ topic: 'notifications.normal' }]);
      this.logger.debug('Resumed notifications.normal topic');
    }

    return result;
  }

  @MessagePattern('notifications.normal')
  async processNormalPriority(
    @Payload() message: ProcessNotificationDto,
  ): Promise<ProcessResponseDto> {
    return this.appService.processNotification(message);
  }
}
