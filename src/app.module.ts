import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TextGenerateController } from './text-generate/text-generate.controller';
import { TextGenerateService } from './text-generate/text-generate.service';

@Module({
  imports: [ConfigModule],
  controllers: [AppController, TextGenerateController],
  providers: [AppService,TextGenerateService],
})
export class AppModule {}
