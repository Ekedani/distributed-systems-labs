import { Injectable, Logger } from '@nestjs/common';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly PROCESSING_DELAY_MS: number = 1000;

  async processNotification(
    request: ProcessNotificationDto,
  ): Promise<ProcessResponseDto> {
    const startTime = Date.now();
    const notificationId = request.id;

    try {
      const processingDelay = this.PROCESSING_DELAY_MS;
      await this.sleep(processingDelay);
      const processingTime = Date.now() - startTime;

      this.logger.log({
        message: 'Notification processed',
        id: notificationId,
        processingTime,
      });

      return {
        success: true,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error({
        message: 'Notification processing failed',
        id: notificationId,
        error: error.message,
      });

      return {
        success: false,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: processingTime,
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
