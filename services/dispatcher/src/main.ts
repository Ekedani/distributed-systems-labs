import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger: new ConsoleLogger({ json: true }),
      transport: Transport.GRPC,
      options: {
        package: 'notification',
        protoPath: join(__dirname, '../proto/notification.proto'),
        url: `${process.env.GRPC_HOST || '0.0.0.0'}:${process.env.GRPC_PORT || 50051}`,
      },
    },
  );

  await app.listen();
}
bootstrap();
