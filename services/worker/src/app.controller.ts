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
  private lagCheckInterval: NodeJS.Timeout | null = null;
  private readonly LAG_CHECK_INTERVAL_MS = 5000;

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
        await this.tryResumeNormalConsumer();
      }
    }
  }

  @MessagePattern('notifications.normal')
  async processNormalPriority(
    @Payload() message: ProcessNotificationDto,
  ): Promise<ProcessResponseDto> {
    return this.appService.processNotification(message);
  }

  private async tryResumeNormalConsumer(): Promise<void> {
    try {
      const highLag = await this.appService.checkHighPriorityLag();
      
      if (highLag === 0) {
        await this.consumer.resume([{ topic: 'notifications.normal' }]);
        this.isPaused = false;
        this.stopLagCheckInterval();
        this.logger.debug('Resumed notifications.normal topic');
      } else {
        this.logger.debug(`High priority lag detected: ${highLag}, deferring resume`);
        this.startLagCheckInterval();
      }
    } catch (error) {
      this.logger.warn('Lag check failed, will retry', error.message);
      this.startLagCheckInterval();
    }
  }

  private startLagCheckInterval(): void {
    if (this.lagCheckInterval) {
      return;
    }

    this.logger.debug('Starting periodic lag check');
    this.lagCheckInterval = setInterval(async () => {
      if (!this.isPaused) {
        this.stopLagCheckInterval();
        return;
      }

      try {
        const highLag = await this.appService.checkHighPriorityLag();
        
        if (highLag === 0 && this.processingHighPriority === 0) {
          await this.consumer.resume([{ topic: 'notifications.normal' }]);
          this.isPaused = false;
          this.stopLagCheckInterval();
          this.logger.debug('Resumed notifications.normal topic via periodic check');
        } else {
          this.logger.debug(`Lag check: highPriority=${highLag}, processing=${this.processingHighPriority}`);
        }
      } catch (error) {
        this.logger.warn('Periodic lag check failed', error.message);
      }
    }, this.LAG_CHECK_INTERVAL_MS);
  }

  private stopLagCheckInterval(): void {
    if (this.lagCheckInterval) {
      clearInterval(this.lagCheckInterval);
      this.lagCheckInterval = null;
      this.logger.debug('Stopped periodic lag check');
    }
  }
}
