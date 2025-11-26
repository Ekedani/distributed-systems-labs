import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ProcessNotificationDto } from './dto/process-notification.dto';
import { ProcessResponseDto } from './dto/process-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @GrpcMethod('NotificationService', 'ProcessNotification')
  processNotification(
    request: ProcessNotificationDto,
  ): ProcessResponseDto {
    return this.appService.processNotification(request);
  }
}
