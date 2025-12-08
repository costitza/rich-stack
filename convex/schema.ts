import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        text: v.string(),
        authorId: v.string(),
        createdAt: v.number(),
    }),
    chat_history: defineTable({
    role: v.string(),     // "user" or "assistant"
    content: v.string(),  // The actual text
    timestamp: v.number(), 
    userId: v.optional(v.string()), // Optional: if you link it to Clerk later
    }),
});