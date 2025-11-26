import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('notifications')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('notifications')
  @ApiOperation({
    summary: 'Create and dispatch a notification',
    description:
      'Sends a notification request to the Dispatcher service via gRPC. Returns timing metrics for performance analysis.',
  })
  @ApiBody({
    type: CreateNotificationDto,
    examples: {
      example1: {
        value: {
          title: 'Welcome',
          message: 'Hello, this is a notification',
          recipient: 'user@example.com',
        },
        description: 'Basic notification example',
      },
    },
  })
  @ApiCreatedResponse({
    type: NotificationResponseDto,
    description: 'Notification successfully created and dispatched',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid notification data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error or dispatcher service unavailable',
  })
  async createNotification(
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.appService.createNotification(
      dto.title,
      dto.message,
      dto.recipient,
    );
  }
}
