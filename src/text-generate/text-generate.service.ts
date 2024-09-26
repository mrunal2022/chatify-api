import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptDTO } from './text-generate.dto';
import { base64Str } from "./base64Str";
import { Writable } from 'stream';

@Injectable()
export class TextGenerateService {
    model: GenerativeModel;
    chat: ChatSession;

    constructor(@Inject(ConfigService) private configService: ConfigService) { }

    private chatHistory = [
        {
            role: "user",
            parts: [{ text: "hi" }],
        },
        {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
    ];

    private getApiKey() {
        return this.configService.get('API_KEY');
    }

    initializeModel() {
        const genAI = new GoogleGenerativeAI(this.getApiKey());
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async initializeChatting(promptObj: PromptDTO) {

        this.initializeModel();
        if (promptObj.imgPrompt) {
            return await this.generateFromMultimodal(promptObj);
        }
        else {
            return await this.generateFromText(promptObj);
        }
    }


    async generateFromText(promptObj: PromptDTO) {
        this.chat = this.model.startChat({ history: this.chatHistory, generationConfig: { maxOutputTokens: null }, });
        const result = await this.chat.sendMessage(promptObj.prompt);
        const response = await result.response;

        let generatedText = {
            text: response.text()
        }
        console.log(generatedText);
        return generatedText;
    }

    async generateFromMultimodal(promptObj: PromptDTO) {

        const imageParts = {
            inlineData: {
                data: base64Str, mimeType: "image/jpg"
            }
        };
        this.chat = this.model.startChat({ history: this.chatHistory, generationConfig: { maxOutputTokens: null }, }); //sending chat history
        const result = await this.model.generateContent([promptObj.prompt, imageParts]);
        const response = await result.response;
        // const text = response.text();
        this.chatHistory.push({ role: "user", parts: [{ text: promptObj.prompt }, { text: imageParts.inlineData.data }] });
        this.chatHistory.push({ role: "model", parts: [{ text: response.text() }] });
        let generatedText = {
            text: response.text()
        }
        return generatedText;
    }

    //call this func only when we reload page
    async getChatHistory() {
        const chatHistory = await this.chat.getHistory();
        return chatHistory;
    }
}





