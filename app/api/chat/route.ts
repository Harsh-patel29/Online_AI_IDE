import dotenv from "dotenv";
import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { Prisma } from "@prisma/client";
import { checkAndUseApiChatBot } from "@/modules/playground/actions";

dotenv.config();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  history: ChatMessage[];
  message: string;
}

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a helpful AI coding assistant named as NeoCode. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    if (!response.text) {
      throw new Error("No message from AI Moel");
    }
    return response.text;
  } catch (error) {
    console.error("Error getting AI response", error);
    throw new Error("Error getting AI response");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message } = body;
    let history: ChatMessage[] = [];
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be string" },
        { status: 400 }
      );
    }
    const user = await currentUser();

    const existing = await db.chatMessage.findFirst({
      where: { userId: user?.id },
    });
    if (existing) {
      const apiCalls = await checkAndUseApiChatBot(existing?.id);

      if (apiCalls.success === false) {
        return NextResponse.json(
          {
            response: apiCalls.message,
          },
          { status: 200 }
        );
      }
    }

    if (existing && Array.isArray(existing.content)) {
      history = existing.content as unknown as ChatMessage[];
    }

    const recentHistory = history.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];
    const aiResponse = await generateAIResponse(messages);

    const newMessages: ChatMessage[] = [
      { role: "user", content: message },
      { role: "assistant", content: aiResponse },
    ];

    let chatMessage;
    if (existing) {
      // Merge old + new messages
      const updatedContent = [
        ...(existing.content as Prisma.JsonArray),
        ...newMessages,
      ] as Prisma.JsonArray;

      chatMessage = await db.chatMessage.update({
        where: { id: existing.id },
        data: {
          content: updatedContent,
          apiCalls: { increment: 1 },
        },
      });
    } else {
      if (user && user?.id) {
        chatMessage = await db.chatMessage.create({
          data: {
            userId: user.id,
            role: "user",
            content: newMessages as unknown as Prisma.JsonArray,
            apiCalls: 1,
          },
        });
      } else {
        throw new Error("User not found");
      }
    }

    return NextResponse.json(
      {
        response: aiResponse,
        timeStamp: new Date().toISOString(),
        chatMessageId: chatMessage.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
