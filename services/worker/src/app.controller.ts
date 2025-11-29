import { Controller, Logger } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  KafkaContext,
  Ctx,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private consumer: any;
  private isPaused: boolean = false;
  private processingHighPriority: number = 0;

  constructor(private readonly appService: AppService) {}

  @MessagePattern('notifications.high')
  async processHighPriority(
    @Payload() message: ProcessNotificationDto,
    @Ctx() context: KafkaContext,
  ): Promise<ProcessResponseDto> {
    if (!this.consumer) {
      this.consumer = context.getConsumer();
    }

    this.processingHighPriority++;

    if (this.processingHighPriority === 1) {
      await this.consumer.pause([{ topic: 'notifications.normal' }]);
      this.isPaused = true;
      this.logger.debug('Paused notifications.normal topic');
    }

    try {
      const result = await this.appService.processNotification(message);
      return result;
    } finally {
      this.processingHighPriority--;

      if (this.processingHighPriority === 0 && this.isPaused) {
        let lagCheckPassed = false;
        try {
          const highLag = await this.appService.checkHighPriorityLag();
          lagCheckPassed = highLag === 0;
        } catch (error) {
          this.logger.warn('Lag check failed, deferring resume', error.message);
          lagCheckPassed = false;
        }

        if (lagCheckPassed) {
          await this.consumer.resume([{ topic: 'notifications.normal' }]);
          this.isPaused = false;
          this.logger.debug('Resumed notifications.normal topic');
        }
      }
    }
  }

  @MessagePattern('notifications.normal')
  async processNormalPriority(
    @Payload() message: ProcessNotificationDto,
  ): Promise<ProcessResponseDto> {
    return this.appService.processNotification(message);
  }
}
