import { ApiProperty } from "@nestjs/swagger";

export class PromptDTO {
    @ApiProperty({ required: true })
    prompt: string;

    @ApiProperty({ required: true })
    chatId: string;

    @ApiProperty({ required: false })
    imgPrompt: string; 

    @ApiProperty({ required: true })
    userId: string;
}
