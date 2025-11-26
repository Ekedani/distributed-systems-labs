import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'notification',
        protoPath: join(__dirname, '../../proto/notification.proto'),
        url: 'localhost:50051',
      },
    },
  );

  await app.listen();
  console.log('Dispatcher microservice is listening on localhost:50051');
}
bootstrap();
