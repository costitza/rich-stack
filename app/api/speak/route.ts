import { elevenlabs } from '@ai-sdk/elevenlabs';
import { experimental_generateSpeech as generateSpeech } from 'ai';

export async function POST(req: Request) {
  const { data } = await req.json();

  const { audio } = await generateSpeech({
    model: elevenlabs.speech('eleven_turbo_v2_5'),
    voice: 'Rachel',
    text: data,
  });

  // FIX: Wrap the uint8Array in Buffer.from(...)
  return new Response(Buffer.from(audio.uint8Array), { 
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}