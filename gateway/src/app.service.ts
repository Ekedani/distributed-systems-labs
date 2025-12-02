import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { GetNotificationResponseDto } from './dto/get-notification-response.dto';
import { lastValueFrom, Observable } from 'rxjs';

interface NotificationDispatcherService {
  dispatchNotification(
    request: DispatchNotificationDto,
  ): Observable<NotificationResponseDto>;
  getNotification(request: { notificationId: string }): Observable<GetNotificationResponseDto>;
  getAllNotifications(request: {}): Observable<{ notifications: GetNotificationResponseDto[] }>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private notificationService: NotificationDispatcherService;

  constructor(@Inject('DISPATCHER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.notificationService = this.client.getService<NotificationDispatcherService>(
      'NotificationDispatcherService',
    );
  }

  async createNotification(
    title: string,
    message: string,
    recipient: string,
  ): Promise<NotificationResponseDto> {
    const sentAt = Date.now();

    return lastValueFrom(
      this.notificationService.dispatchNotification({
        title,
        message,
        recipient,
        sentAt,
      }),
    );
  }

  async getNotification(notificationId: string): Promise<GetNotificationResponseDto> {
    return lastValueFrom(
      this.notificationService.getNotification({ notificationId }),
    );
  }

  async getAllNotifications(): Promise<{ notifications: GetNotificationResponseDto[] }> {
    return lastValueFrom(
      this.notificationService.getAllNotifications({}),
    );
  }
}
