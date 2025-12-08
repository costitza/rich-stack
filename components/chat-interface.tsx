"use client";

import { useChat } from "@ai-sdk/react";
import { type Message } from "ai"; // Import types to fix "any" errors
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, StopCircle, Loader2 } from "lucide-react";

export function ChatInterface() {
  // 1. CONVEX
  const saveMessage = useMutation(api.chat.saveMessage); 

  // 2. AUDIO STATE
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 3. VERCEL AI SDK
  // We extract 'input' and 'handleInputChange' from the hook. 
  // DO NOT create your own useState for input.
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "../app/api/chat",
    
    // Fix "Implicit any" by adding ': Message'
    onFinish: async (message: Message) => {
      // A. Save Assistant message to Convex
      await saveMessage({ role: "assistant", content: message.content });
      
      // B. Speak it
      speakText(message.content);
    },
    onError: (err) => {
      console.error("AI SDK Error:", err);
    }
  });

  // 4. CUSTOM SUBMIT
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // We capture the current input value before handleSubmit clears it
    const userMessage = input;

    // Save to Convex
    await saveMessage({ role: "user", content: userMessage });
    
    // Send to OpenAI (this automatically clears the input for you)
    handleSubmit(e);
  };

  // 5. TEXT-TO-SPEECH
  const speakText = async (text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsSpeaking(true);

      const response = await fetch("/api/speak", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS Failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  // Auto-scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-lg mx-auto h-[600px] flex flex-col shadow-xl">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span>AI Voice Agent</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <p>Say hello to start!</p>
              </div>
            )}
            
            {/* Fix "Implicit any" on map by typing 'm: Message' */}
            {messages.map((m: Message) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {m.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm ml-12">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background">
        <form onSubmit={onSubmit} className="flex w-full gap-2">
          {/* IMPORTANT: Connect value and onChange to the hook's variables */}
          <Input
            value={input}
            onChange={handleInputChange} 
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          
          {isSpeaking ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={stopAudio}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
        <audio ref={audioRef} className="hidden" />
      </CardFooter>
    </Card>
  );
}