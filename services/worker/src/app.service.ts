import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  processNotification(
    request: ProcessNotificationDto,
  ): ProcessResponseDto {
    const startTime = Date.now();
    const notificationId = uuidv4();

    console.log(
      `[Worker] ${new Date().toISOString()} - Processing notification: ${request.title} for ${request.recipient}`,
    );

    const maxDelay = this.configService.get('MAX_PROCESSING_DELAY_MS') || 100;
    const processingDelay = Math.random() * maxDelay;
    const processingTime = Date.now() - startTime;

    console.log(
      `[Worker] ${new Date().toISOString()} - Notification processed in ${processingTime}ms`,
    );

    return {
      success: true,
      notificationId: notificationId,
      processedAt: Date.now(),
      processingTimeMs: processingTime,
    };
  }
}
