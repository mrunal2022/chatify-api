import { BadRequestException, Body, Controller, Get, Header, Post } from '@nestjs/common';
import { TextGenerateService } from './text-generate.service';
import { PromptDTO } from './text-generate.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';


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
  async generateText(@Body() prompt: PromptDTO): Promise<any> {
    try {
      return await this.textGenerateService.initializeChatting(prompt);
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  @Get('/getChatHistory')
	@Header('Content-Type', 'application/json')
	@ApiTags('Get chat history')
	@ApiResponse({ status: 200, description: 'Data Fetched Successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getDurationFilter(): Promise<any> {
		try {
			return await this.textGenerateService.getChatHistory();
		} catch (error) {
			throw new BadRequestException(error.detail);
		}
	}
}
