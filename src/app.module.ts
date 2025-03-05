import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TextGenerateController } from './text-generate/text-generate.controller';
import { TextGenerateService } from './text-generate/text-generate.service';
import { ConversationHistorySchema } from './chat_history/chat_history.schema';
import { SignUpController } from './login/sign-up.controller';
import { SignUpService } from './login/sign-up.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env globally
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    MongooseModule.forFeature([{ name: 'ConversationHistory', schema: ConversationHistorySchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
  ],
  controllers: [AppController, TextGenerateController, SignUpController],
  providers: [AppService, TextGenerateService, SignUpService],
})
export class AppModule {}
