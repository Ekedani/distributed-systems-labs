import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private configService: ConfigService) {}

  async processNotification(
    request: ProcessNotificationDto,
  ): Promise<ProcessResponseDto> {
    const startTime = Date.now();
    const notificationId = uuidv4();

    try {
      

      const maxDelay = parseInt(
        this.configService.get('MAX_PROCESSING_DELAY_MS') || '100',
        10,
      );
      const processingDelay = Math.random() * maxDelay;
      await this.sleep(processingDelay);

      const processingTime = Date.now() - startTime;

      this.logger.log(
        { id: notificationId, processingTime },
        `Notification processed`,
      );

      return {
        success: true,
        notificationId,
        processedAt: Date.now(),
        processingTimeMs: processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        { id: notificationId, processingTime },
        `Error processing notification: ${error.message}`,
        error.stack,
      );

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
