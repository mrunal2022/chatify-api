import { ApiProperty } from "@nestjs/swagger";

export class PromptDTO {
    @ApiProperty({ required: true })
    prompt: string;

    @ApiProperty({ required: false })
    imgPrompt: string; 
}
