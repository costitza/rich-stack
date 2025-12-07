"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Messages() {
    const [text, setText] = useState("");

    // convex hooks
    const messages = useQuery(api.messages.list);
    const sendMessage = useMutation(api.messages.send);

    const handleSend = async () => {
        if (!text.trim()) return;

        await sendMessage({ text });
        setText(""); // clear box after sending
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-4">

        {/* Input box */}
        <div className="flex gap-2">
            <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            />
            <Button onClick={handleSend}>Send</Button>
        </div>

        {/* Messages list */}
        <div className="space-y-2">
            {messages?.map((msg) => (
            <div
                key={msg._id}
                className="p-3 rounded-xl bg-gray-100 border text-gray-800"
            >
                {msg.text}
            </div>
            ))}
        </div>

        </div>
    );
}
