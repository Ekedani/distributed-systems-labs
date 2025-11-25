import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "DISPATCHER_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: 'dispatcher',
          protoPath: join(__dirname, 'dispatcher/dispatcher.proto'),
        },
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
