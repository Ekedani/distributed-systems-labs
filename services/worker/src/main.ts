import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: process.env.KAFKA_CLIENT_ID || 'dispatcher-service',
          brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        },
        consumer: {
          groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'notifications-consumer',
        },
      },
      logger: new ConsoleLogger({ json: true }),
    },
  );

  await app.listen();
}
bootstrap();
