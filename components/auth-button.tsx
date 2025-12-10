"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    // Simulate authentication logic
    setIsAuthenticated(true);
  };

  const handleNavigate = () => {
    router.push("/chat"); // Navigate to the chatbot page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Login
        </button>
      ) : (
        <button
          onClick={handleNavigate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Chatbot
        </button>
      )}
    </div>
  );
}
