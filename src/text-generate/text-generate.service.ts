import { ChatSession, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationHistory } from 'src/chat_history/chat_history.schema';
import { PromptDTO } from './text-generate.dto';

@Injectable()
export class TextGenerateService {
    model: GenerativeModel;
    chat: ChatSession;

    constructor(@Inject(ConfigService) private configService: ConfigService,
        @InjectModel('ConversationHistory') private conversationModel: Model<ConversationHistory>,  // Inject model
    ) { }

    private chatHistory = {
        chatId: "",
        chatConversation:
            [
                {
                    role: "user",
                    parts: [{ text: "hi" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Great to meet you. What would you like to know?" }],
                },
            ]
    };

    private getApiKey() {
        return this.configService.get('API_KEY');
    }

    initializeModel() {
        const genAI = new GoogleGenerativeAI(this.getApiKey());
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async initializeChatting(promptObj: PromptDTO) {
        this.initializeModel();
        this.chatHistory.chatId = promptObj.chatId;

        //fetch chat history for a particular chatId from DB and then pass it to the history parameter of the model so that it gets trained on the history
        let chatById: any = await this.getChatById(promptObj.chatId);
        if (chatById) {
            chatById.messages.forEach(element => {
                const filteredParts = element.parts.map(part => {
                    const { _id, ...rest } = part; // Exclude the 'id' key
                    return rest;
                });

                // Push the filtered data to chatConversation
                this.chatHistory.chatConversation.push({
                    role: element.role,
                    parts: filteredParts
                });
            });
        } else {
            //TODO: implement generation of title using langchain & gemini api
            try {
                await this.conversationModel.create({
                    chatId: promptObj.chatId,
                    userId: "testUserId",
                    title: "Test Title",
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } catch (error) {
                console.error('Error during create:', error);
            }

        }
        if (!this.chat) {
            this.chat = this.model.startChat({ history: this.chatHistory.chatConversation, generationConfig: { maxOutputTokens: null }, });
        }
        if (promptObj?.imgPrompt) {
            return await this.generateFromMultimodal(promptObj);
        }
        else {
            return await this.generateFromText(promptObj);
        }
    }

    async generateFromText(promptObj: PromptDTO) {
        const result = await this.chat.sendMessage(promptObj.prompt);
        const response = await result.response;

        let generatedText = {
            text: response.text()
        }
        this.updateMessages(promptObj.chatId, promptObj.prompt, promptObj.imgPrompt, generatedText.text);
        return generatedText;
    }

    async generateFromMultimodal(promptObj: PromptDTO) {

        const imageParts = {
            inlineData: {
                data: promptObj.imgPrompt, mimeType: "image/jpg"
            }
        };
        const result = await this.model.generateContent([promptObj.prompt, imageParts]);
        const response = await result.response;
        this.chatHistory.chatConversation.push({ role: "user", parts: [{ text: promptObj.prompt }, { text: imageParts.inlineData.data }] });
        this.chatHistory.chatConversation.push({ role: "model", parts: [{ text: response.text() }] });
        let generatedText = {
            text: response.text()
        }
        this.updateMessages(promptObj.chatId, promptObj.prompt, promptObj.imgPrompt, generatedText.text);
        return generatedText;
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


    async getChatHistoryList(): Promise<any> {
        return await this.conversationModel.find().lean().exec() // Fetch all conversations list from MongoDB   
    }

    async getChatById(chatId: string): Promise<any> {
        let chat: any = await this.conversationModel.findOne({ chatId }).lean().exec();
        return chat;
    }

    //call this func only when we reload page
    async getChatHistory() {
        const chatHistory = await this.chat.getHistory();
        return chatHistory;
    }

}




