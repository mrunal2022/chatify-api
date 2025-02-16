import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TextGenerateController } from './text-generate/text-generate.controller';
import { TextGenerateService } from './text-generate/text-generate.service';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConversationHistorySchema } from './chat_history/chat_history.schema';

@Module({
  imports: [ ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    MongooseModule.forFeature([{ name: 'ConversationHistory', schema: ConversationHistorySchema }]),
  ConfigModule],
  controllers: [AppController, TextGenerateController],
  providers: [AppService, TextGenerateService],
})
export class AppModule { }
