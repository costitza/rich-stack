// convex/chat.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveMessage = mutation({
  args: { 
    role: v.string(), 
    content: v.string() 
  },
  handler: async (ctx, args) => {
    // Note: If you want to force users to be logged in, uncomment next line:
    // const identity = await ctx.auth.getUserIdentity();
    
    await ctx.db.insert("chat_history", {
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
      // userId: identity?.subject, // Add this if you want to filter by user later
    });
  },
});