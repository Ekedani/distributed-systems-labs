import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;

  const config = new DocumentBuilder()
    .setTitle('Notification Gateway API')
    .setDescription(
      'API Gateway for distributed notification system with gRPC communication',
    )
    .setVersion('1.0')
    .addTag('notifications', 'Notification management endpoints')
    .addServer(`http://localhost:${port}`, 'Development')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    customSiteTitle: 'Notification Gateway API Docs',
    swaggerOptions: {
      displayOperationId: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(port);
  console.log(`Gateway is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

bootstrap();
