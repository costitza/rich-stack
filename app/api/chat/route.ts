"use server";

import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';

const openaiInstance = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure the .env file contains OPENAI_API_KEY
}).chat('gpt-3.5-turbo');

console.log("this is a test log");
console.log(process.env.OPENAI_API_KEY); // Debug: Check if the API key is loaded

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openaiInstance,
    messages: convertToModelMessages(messages),
  });

  // FALLBACK: If .toDataStreamResponse() fails, use this:
  return result.toUIMessageStreamResponse(); 
}