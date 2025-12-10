"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { UIMessage } from "ai"; // Import the UIMessage type

// Helper: extract plain text from a UIMessage's parts
function getMessageText(m: UIMessage) {
  const textPart = m.parts.find((part) => part.type === "text") as
    | { text: string }
    | undefined;
  return textPart?.text ?? "";
}

export default function Chat() {
  const { messages, status, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Convert new assistant messages to speech
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.id !== lastMessageIdRef.current
    ) {
      lastMessageIdRef.current = lastMessage.id;

      const text = getMessageText(lastMessage);
      if (!text) return;

      // Forward assistant text to ElevenLabs speech endpoint
      fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: text }),
      })
        .then((res) => res.blob())
        .then((audioBlob) => {
          const url = URL.createObjectURL(audioBlob);
          if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch(() => {
              // Autoplay might be blocked; user can press play
            });
          }
        })
        .catch((err) => console.error("Speech generation failed:", err));
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

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto p-4">
      <audio ref={audioRef} />

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
