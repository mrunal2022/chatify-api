import { BadRequestException, Body, Controller, Get, Header, Post, Query } from '@nestjs/common';
import { TextGenerateService } from './text-generate.service';
import { PromptDTO } from './text-generate.dto';
import { ApiTags, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DecodedToken } from 'src/user.decorator';


@Controller()
export class TextGenerateController {

	constructor(private textGenerateService: TextGenerateService) { }

	@Post('/text-generate-from-multimodal')
	@Header('Content-Type', 'text/plain')
	@ApiTags('generate text from text/image input from gemini api')
	@ApiResponse({ status: 200, description: 'Data Fetched Successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiBody({
		description:
			'Generate text for chat - Payload Structure',
		type: PromptDTO,
		required: true,
	})
	async generateText(@Body() prompt: PromptDTO, @DecodedToken() tokenObj: any): Promise<any> {
		try {
			return await this.textGenerateService.initializeChatting(prompt, tokenObj);
		} catch (error) {
			throw new BadRequestException(error.detail);
		}
	}

	@Get('/getChatHistoryList')
	@Header('Content-Type', 'application/json')
	@ApiTags('Get conversation history list')
	@ApiResponse({ status: 200, description: 'Data Fetched Successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getChatHistoryList( @DecodedToken() tokenObj: any): Promise<any> {
		try {
			return await this.textGenerateService.getChatHistoryList(tokenObj);
		} catch (error) {
			throw new BadRequestException(error.detail);
		}
	}

	@Get('/getChatHistoryGemini')
	@Header('Content-Type', 'application/json')
	@ApiTags('Get chat history gemini')
	@ApiResponse({ status: 200, description: 'Data Fetched Successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getChatHistory(): Promise<any> {
		try {
			return await this.textGenerateService.getChatHistory();
		} catch (error) {
			throw new BadRequestException(error.detail);
		}
	}

	@Get('/getChatByChatId')
	@Header('Content-Type', 'application/json')
	@ApiTags('Get chat by id')
	@ApiResponse({ status: 200, description: 'Data Fetched Successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiQuery({ name: 'chatId' })
	async getChatById(@Query('chatId') chatId: string): Promise<any> {
		try {
			return await this.textGenerateService.getChatById(chatId);
		} catch (error) {
			throw new BadRequestException(error.detail);
		}
	}
}
