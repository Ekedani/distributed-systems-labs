import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  private dispatcherService: any;

  onModuleInit() {
    throw new Error('Method not implemented.');
  }

  createNotification(): string {
    return 'Hello World!';
  }
}
