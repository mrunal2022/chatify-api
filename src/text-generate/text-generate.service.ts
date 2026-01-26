import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationHistory } from 'src/chat_history/chat_history.schema';
import { PromptDTO } from './text-generate.dto';
import { PromptTemplate } from "@langchain/core/prompts";
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class TextGenerateService {
    private ai: GoogleGenAI;

    constructor(
        @Inject(ConfigService) private configService: ConfigService,
        @InjectModel('ConversationHistory') private conversationModel: Model<ConversationHistory>,
    ) {
        this.ai = new GoogleGenAI({
            apiKey: this.configService.get('API_KEY')
        });
    }

    private chatHistory = {
        chatId: "",
        chatConversation: []
    };

    // Keep your getModel for easy updates
    getModel() {
        return "gemini-2.5-flash";
    }

    async initializeChatting(promptObj: PromptDTO, tokenObj: any) {
        this.chatHistory.chatId = promptObj.chatId;

        let chatById: any = await this.getChatById(promptObj.chatId);
        this.chatHistory.chatConversation = [];

        if (chatById) {
            // Your existing logic for filtering history remains untouched
            chatById.messages.forEach(element => {
                const filteredParts = element.parts.map(part => {
                    const { _id, ...rest } = part;
                    return rest;
                });

                this.chatHistory.chatConversation.push({
                    role: element.role,
                    parts: filteredParts
                });
            });
        } else {
            try {
                const title: string = await this.getTitleForConversation(promptObj);
                await this.conversationModel.create({
                    chatId: promptObj.chatId,
                    userId: tokenObj.email,
                    title: title,
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } catch (error) {
                console.error('Error during create:', error);
            }
        }

        // Logic routing
        if (promptObj?.imgPrompt) {
            return await this.generateFromMultimodal(promptObj);
        } else {
            return await this.generateFromText(promptObj);
        }
    }

    async generateFromText(promptObj: PromptDTO) {
        const response = await this.ai.models.generateContent({
            model: this.getModel(),
            contents: [
                ...this.chatHistory.chatConversation,
                { role: "user", parts: [{ text: promptObj.prompt }] }
            ]
        });

        const generatedText = response.text;

        this.updateMessages(promptObj.chatId, promptObj.prompt, promptObj.imgPrompt, generatedText);
        return { text: generatedText };
    }

    private getMimeType(base64: string): string {
        const signatures: { [key: string]: string } = {
            "iVBORw0KGgo": "image/png",
            "/9j/": "image/jpeg",
            "UklGR": "image/webp",
            "JVBERi0": "application/pdf",
            "AAAACmZ0eXBoZWlj": "image/heic",
            "AAAACmZ0eXBoZWlm": "image/heif"
        };

        for (const sign in signatures) {
            if (base64.startsWith(sign)) {
                return signatures[sign];
            }
        }

        // Default to jpeg if no signature matches
        return "image/jpeg";
    }

    async generateFromMultimodal(promptObj: PromptDTO) {
        // Extract pure base64 (removes data:image/png;base64, etc.)
        const base64Data = promptObj.imgPrompt.includes(',')
            ? promptObj.imgPrompt.split(',')[1]
            : promptObj.imgPrompt;

        //  Detect the MIME type dynamically
        const detectedMime = this.getMimeType(base64Data);

        // Request with the specific model (gemini-3-flash-preview)
        const response = await this.ai.models.generateContent({
            model: this.getModel(),
            contents: [
                ...this.chatHistory.chatConversation,
                {
                    role: "user",
                    parts: [
                        { text: promptObj.prompt },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: detectedMime
                            }
                        }
                    ]
                }
            ]
        });

        const generatedText = response.text || "I couldn't analyze this file.";
        this.updateMessages(promptObj.chatId, promptObj.prompt, promptObj.imgPrompt, generatedText);

        return { text: generatedText };
    }

    async getTitleForConversation(promptObj: PromptDTO) {
        const promptTemplate: PromptTemplate = PromptTemplate.fromTemplate(
            `Summarize the given text strictly in not more than 3-4 words: {prompt}`
        );
        const formattedPrompt = await promptTemplate.format({
            prompt: promptObj.prompt
        });

        const response = await this.ai.models.generateContent({
            model: this.getModel(),
            contents: [{ role: "user", parts: [{ text: formattedPrompt }] }],
            config: {
                temperature: 0.3 // Low temperature for consistent titles
            }
        });

        return response.text || "New Conversation";
    }

    async updateMessages(chatId: string, textPrompt: string, imgPrompt: string, generatedText: string) {
        return await this.conversationModel.findOneAndUpdate(
            { chatId },
            {
                $push: {
                    messages: {
                        $each: [
                            {
                                role: "user",
                                parts: [{ text: textPrompt }, ...(imgPrompt ? [{ text: imgPrompt }] : [])] //if img prompt exists then add in parts
                            },
                            {
                                role: "model",
                                parts: [{ text: generatedText }]
                            }
                        ]
                    }
                },
                $set: { updatedAt: new Date() } // Update the timestamp
            },
            { new: true } // Return the updated document
        ).exec();
    }


    async getChatHistoryList(tokenObj: any): Promise<any> {
        return (await this.conversationModel.find({ userId: tokenObj.email }).sort({ createdAt: -1 }).lean().exec());
    }

    async getChatById(chatId: string): Promise<any> {
        let chat: any = await this.conversationModel.findOne({ chatId }).lean().exec();
        return chat;
    }


}




