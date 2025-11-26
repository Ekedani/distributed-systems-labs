import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
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
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`,
      },
    },
  );

  await app.listen();
  console.log(`Dispatcher microservice is listening on ${process.env.GRPC_HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`);
}
bootstrap();
