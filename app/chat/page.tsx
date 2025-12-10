import { SignedIn, SignedOut } from "@clerk/nextjs";
import Chat from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <SignedIn>
        <Chat />
      </SignedIn>
      <SignedOut>
        <p className="text-gray-600">Please sign in to access the chatbot.</p>
      </SignedOut>
    </div>
  );
}
