import { elevenlabs } from '@ai-sdk/elevenlabs';
import { experimental_generateSpeech as generateSpeech } from 'ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body received:", body); // Debugging log

    const data = body.data;
    if (!data || typeof data !== "string" || data.trim() === "") {
      console.error("Invalid data in request body:", data); // Debugging log
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Received text for speech generation:", data); // Debugging log

    const { audio } = await generateSpeech({
      model: elevenlabs.speech('eleven_turbo_v2_5'),
      voice: 'CwhRBWXzGAHq8TQ4Fs17',
      text: data,
    });

    console.log("Speech generated successfully."); // Debugging log

    // Wrap the uint8Array in Buffer.from(...)
    return new Response(Buffer.from(audio.uint8Array), {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("Error in speech generation API:", error); // Debugging log
    return new Response(
      JSON.stringify({ error: "Failed to generate speech" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}