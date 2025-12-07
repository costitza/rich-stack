import { stringify } from 'querystring';
import { query, mutation } from './_generated/server'
import { v } from "convex/values";


export const list = query(async ({ db }) => {
    return await db.query("messages").order("asc").collect();
});

export const send = mutation(
  async ({ db, auth }, { text }: { text: string }) => {
    const user = await auth.getUserIdentity();
    if (!user) throw new Error("Not authenticated");

    await db.insert("messages", {
      text,
      authorId: user.subject,
      createdAt: Date.now(),
    });
  }
);