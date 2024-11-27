import { Schema, Document } from "mongoose";

export const ConversationHistorySchema = new Schema(
    {
      userId: { type: String, required: true },
      title: { type: String, required: true },
      messages: [
        {
          role: { type: String, enum: ['user', 'model'], required: true },
          parts: [{ text: { type: String, required: true } }],
        },
      ],
      createdAt: { type: Date, required: true },
      updatedAt: { type: Date, required: true },
    },
    { collection: 'conversation_history' }
  );
  
  export interface ConversationHistory extends Document {
    userId: string;
    title: string;
    messages: {
      role: 'user' | 'model';
      parts: { text: string }[];
    }[];
    createdAt: Date;
    updatedAt: Date;
  }