import { BadRequestException, Controller, Post, Body, Header } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpService } from './sign-up.service';

@Controller()
export class SignUpController {
    constructor(private readonly signUpService: SignUpService) {}

    @Post('/sign-up')
    @Header('Content-Type', 'application/json')
    @ApiTags('sign up using google')
    @ApiResponse({ status: 200, description: 'User signed up successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBody({ required: true })
    async signUp(@Body() params: { credential: string }): Promise<any> {
        try {
            if (!params.credential) {
                throw new BadRequestException('Credential is required');
            }
            const response = await this.signUpService.signUpWithGoogle(params.credential);
            return response;
        } catch (error) {
            throw new BadRequestException(error.message || 'Error during signup');
        }
    }
}
