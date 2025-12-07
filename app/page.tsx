'use client'

import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Button } from '@/components/ui/button'
import Messages from "../components/Messages";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-black to-blue-900">

      {/* Navbar */}
      <nav className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-white">Rich Stack</h1>

        <Authenticated>
          <UserButton />
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode="modal">
            <Button variant="outline" className="hover:bg-blue-400">Sign In</Button>
          </SignInButton>
        </Unauthenticated>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center flex-1 px-6">
        <h1 className="text-5xl font-bold mb-4 text-[#ebe6da]">
          Build something amazing.
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          A clean landing page built with Next.js, Tailwind, shadcn/ui, and Clerk authentication.
        </p>

        <Unauthenticated>
          <SignInButton mode="modal">
            <Button size="lg" className="text-lg px-8 py-6 hover:bg-blue-600">
              Get Started
            </Button>
          </SignInButton>
        </Unauthenticated>

        <Authenticated>
          <Messages />
        </Authenticated>
      </main>
    </div>
  );
}