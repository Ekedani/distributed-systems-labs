import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  createNotification(): string {
    return 'Hello World!';
  }
}
