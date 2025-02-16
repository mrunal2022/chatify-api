/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { APP_ROOT } from './text-generate/text-generate.constant';
import * as express from 'express';

async function bootstrap() {
  dotenv.config(); // Load environment variables at the beginning
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(APP_ROOT);
  const cors = require('cors');
  const corsOptions = {
    origin: ['http://localhost:4200','https://chatify-ui.onrender.com'],
    credentials: true,           
    optionSuccessStatus: 200
  }
  app.use(cors(corsOptions));

  app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit to 10MB
  app.use(express.urlencoded({ limit: '10mb', extended: true })); // Increase URL-encoded payload limit to 10MB
  const config = new DocumentBuilder()
    .setTitle('Integrate Gemini API')
    .setDescription('To generate text from Gemini API')
    .setVersion('1.0')
    .addTag("genAI")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);

}
bootstrap();
