import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications',
      {
        replicaSet: 'rs0',
      },
    ),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: `${process.env.KAFKA_CLIENT_ID || 'notifications-dispatcher'}-producer`,
            brokers: process.env.KAFKA_BROKERS?.split(',') || [
              'localhost:9092',
            ],
          },
          producer: {
            allowAutoTopicCreation: false,
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
