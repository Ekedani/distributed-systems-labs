import { Injectable, Logger } from '@nestjs/common';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';
import { Kafka, Admin } from 'kafkajs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly PROCESSING_DELAY_MS: number = 1000;
  private admin: Admin;
  private kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      clientId: process.env.KAFKA_CLIENT_ID || 'notifications-processor',
    });
  }

  async checkHighPriorityLag(): Promise<number> {
    try {
      if (!this.admin) {
        this.admin = this.kafka.admin();
        await this.admin.connect();
      }

      const partitions = await this.admin.fetchTopicOffsets('notifications.high');
      const consumerGroupOffsets = await this.admin.fetchOffsets({
        groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'notifications-consumer',
        topics: ['notifications.high'],
      });

      let totalLag = 0;

      for (const partition of partitions) {
        const logEndOffset = Number(partition.high);
        const groupOffset = consumerGroupOffsets.find((g) => g.topic === 'notifications.high');
        const partitionOffset = groupOffset?.partitions.find(
          (p) => p.partition === Number(partition.partition),
        );
        const committedOffset = Number(partitionOffset?.offset ?? 0);
        totalLag += Math.max(logEndOffset - committedOffset, 0);
      }

      return totalLag;
    } catch (error) {
      this.logger.error('Failed to check high priority lag', error.message);
      return 0;
    }
  }

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
