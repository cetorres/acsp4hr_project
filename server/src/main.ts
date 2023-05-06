import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = new ConfigService();

  app.enableCors({
    credentials: true
  });

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  if (configService.get('ENV') == 'DEV') {
    const config = new DocumentBuilder()
      .setTitle('ACSP4HR API')
      .setDescription('The API for the ACSP4HR research project.')
      .setVersion('1.0.0')
      .addTag('ACSP4HR')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(3000);
  console.log(`API application is running on: ${await app.getUrl()}`);
}
bootstrap();
