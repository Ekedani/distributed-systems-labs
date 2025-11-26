import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'Whether the notification was successfully processed',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: String,
    description: 'Unique notification identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  notificationId: string;

  @ApiProperty({
    type: Number,
    description: 'Timestamp when notification was processed (milliseconds since epoch)',
    example: 1700000000000,
    required: false,
  })
  processedAt?: number;

  @ApiProperty({
    type: Number,
    description: 'Total processing time at dispatcher (milliseconds)',
    example: 5,
  })
  processingTimeMs: number;

  @ApiProperty({
    type: Number,
    description: 'Total time from gateway to response (milliseconds)',
    example: 15,
    required: false,
  })
  gatewayTotalTimeMs?: number;

  @ApiProperty({
    type: Number,
    description: 'Processing time at dispatcher service (milliseconds)',
    example: 5,
    required: false,
  })
  dispatcherProcessingTimeMs?: number;
}
