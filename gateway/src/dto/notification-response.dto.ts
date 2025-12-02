import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    type: String,
    description: 'Unique notification identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  notificationId: string;
}
