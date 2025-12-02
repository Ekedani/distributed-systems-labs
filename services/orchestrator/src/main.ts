import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: process.env.KAFKA_CLIENT_ID || 'notifications-orchestrator',
          brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        },
        consumer: {
          groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'orchestrator-group',
          allowAutoTopicCreation: false,
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
          retry: {
            retries: 5,
            initialRetryTime: 100,
          },
        },
        run: {
          autoCommit: true,
          autoCommitInterval: 5000,
          autoCommitThreshold: 1,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
