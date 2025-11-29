import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    type: String,
    description: 'Notification title',
    example: 'Welcome to our service',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @ApiProperty({
    type: String,
    description: 'Notification message content',
    example: 'This is a test notification message',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  message: string;

  @ApiProperty({
    type: String,
    description: 'Recipient email or identifier',
    example: 'user@example.com',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  recipient: string;

  @ApiProperty({
    type: String,
    example: 'high',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  priority: string;
}
