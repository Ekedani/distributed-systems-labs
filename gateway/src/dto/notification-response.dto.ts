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
}
