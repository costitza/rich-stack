import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  // FALLBACK: If .toDataStreamResponse() fails, use this:
  return result.toUIMessageStreamResponse(); 
}