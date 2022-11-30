import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ServiceExceptionFilter } from './shared/service-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new ServiceExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder().setTitle('Praise API').build();
  const document = SwaggerModule.createDocument(app, config);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: '*',
  });
  await app.listen(process.env.API_PORT || 3000);
}
bootstrap();