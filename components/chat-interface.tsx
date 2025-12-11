"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { UIMessage } from "ai"; // Import the UIMessage type

// Helper: extract plain text from a UIMessage's parts
function getMessageText(m: UIMessage) {
  if (!m.parts || !Array.isArray(m.parts)) {
    console.error("Invalid message parts:", m.parts); // Debugging log
    return "";
  }

  const textPart = m.parts.find((part) => part.type === "text");
  if (!textPart) {
    console.error("No text part found in message parts:", m.parts); // Debugging log
    return "";
  }

  return textPart.text || "";
}

// Function to generate speech from text using ElevenLabs API
async function generateSpeechFromText(
  text: string,
  audioRef: React.RefObject<HTMLAudioElement | null>,
  setAudioUrl: (url: string | null) => void
) {
  console.log("SA APELATTTTT Generating speech for text:", text); // Debugging log
  if (!text || text.trim() === "") {
    console.log("Text is empty, skipping speech generation."); // Debugging log
    return;
  }

  console.log("Sending text to speech API:", text); // Debugging log

  try {
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: text }),
    });

    console.log("Response status:", res.status); // Debugging log

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);
    console.log("Audio URL generated:", url); // Debugging log
    setAudioUrl(url); // Store the audio URL in state

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current
        .play()
        .catch(() => console.log("Autoplay blocked, use Play button."));
    }
  } catch (err) {
    console.error("Speech generation failed:", err);
  }
}

export default function Chat() {
  const { messages, status, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // State to store audio URL

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Convert new assistant messages to speech
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage &&
      lastMessage.role === "assistant"
    ) {
      lastMessageIdRef.current = lastMessage.id;

      generateSpeechFromText(lastMessage.parts.reduce((acc, part) => acc + (part.type === "text" ? part.text : ""), ""), audioRef, setAudioUrl);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Send user message in the expected UIMessage format
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: trimmed }],
    });

    setInput("");
  };

  const playTestMessage = () => {
    const testMessage = "Hi there, world!";
    console.log("Sending hardcoded test message to speech API:", testMessage); // Debugging log

    generateSpeechFromText(testMessage, audioRef, setAudioUrl);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto p-4">
      <audio ref={audioRef} />
      <button
        onClick={playTestMessage}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded"
      >
        Play Test Message
      </button>
      {audioUrl && (
        <button
          onClick={() => {
            console.log("Play button clicked, playing audio."); // Debugging log
            if (audioRef.current) {
              audioRef.current.play().catch((err) => {
                console.error("Failed to play audio:", err);
              });
            }
          }}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Play Speech
        </button>
      )}

      <div className="flex-1 space-y-3 mb-4 max-h-96 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded ${
              m.role === "user" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <strong>{m.role}:</strong> {getMessageText(m)}
          </div>
        ))}
        {status === "streaming" && (
          <div className="p-2 text-gray-500 italic">Thinking…</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something…"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
