// this.chatHistory.push({ role: "user", parts: [{ text: promptObj.prompt }] });
      
// this.chatHistory.push({ role: "model", parts: [{ text: text }] });

// import * as fs from 'fs';

// for (let i of this.chatHistory) {
//     console.log(i.parts[0])
// }
        
// private chatHistory1 = {
    //     chatConversation:
    //         [
    //             {
    //                 role: "user",
    //                 parts: [{ text: "hi" }],
    //             },
    //             {
    //                 role: "model",
    //                 parts: [{ text: "Great to meet you. What would you like to know?" }],
    //             },
    //         ]
    // };

  // async getTitleForConversation(list) {

    //     console.log("hi", list);
    //     console.log("ho");
    //     let obj = { "_id": "6734784130aab673a9826e20", "chatId": "b4e73d67-4a04-40dc-8668-c521ab38cc5f", "userId": "someUserId", "title": "", "messages": [{ "_id": "673b6fb65b849015a47b8dd3", "role": "user", "parts": [{ "_id": "673b6fb65b849015a47b8dd4", "text": "When is Virat Kohli's birthday?" }] }, { "_id": "673b6fb65b849015a47b8dd5", "role": "model", "parts": [{ "_id": "673b6fb65b849015a47b8dd6", "text": "His birthday is on November 5." }] }, { "_id": "673b6fb65b849015a47b8dd7", "role": "user", "parts": [{ "_id": "673b6fb65b849015a47b8dd8", "text": "How old is he?" }] }, { "_id": "673b6fb65b849015a47b8dd9", "role": "model", "parts": [{ "_id": "673b6fb65b849015a47b8dda", "text": "He was born in 1988, so he turned 36 in 2024." }] }], "createdAt": "2024-11-12T14:30:00.000Z", "updatedAt": "2024-11-12T14:45:00.000Z" };
    //     const prompt = PromptTemplate.fromTemplate(
    //         `summarize the messages in obj in 3-4 words{obj}`
    //     );


    //     const formattedPrompt = await prompt.format({
    //         obj
    //     });
    //     console.log(formattedPrompt, "******");
    //     this.initializeModel();


    //     this.chat = this.model.startChat({ history: this.chatHistory1.chatConversation, generationConfig: { maxOutputTokens: null }, });
    //     const result = await this.chat.sendMessage(formattedPrompt);
    //     const response = await result.response;

    //     let generatedText = {
    //         text: response.text()
    //     }
    //     console.log(generatedText, "generatedText");

    // }
