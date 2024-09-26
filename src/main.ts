/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { APP_ROOT } from './text-generate/text-generate.constant';

async function bootstrap() {
  dotenv.config(); // Load environment variables at the beginning
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(APP_ROOT);
  const cors = require('cors');
  const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,           
    optionSuccessStatus: 200
  }
  app.use(cors(corsOptions));
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
