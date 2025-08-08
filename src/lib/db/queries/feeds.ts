import { db } from "..";
import { feeds } from "../schema";
import {eq, sql} from "drizzle-orm";

export type Feed = typeof feeds.$inferSelect;

export async function createFeed(name: string, url: string, user_id: string): Promise<Feed>
{
    const [result] = await db
        .insert(feeds)
        .values({   name: name,
                    url: url,
                    userId: user_id
                })
        .returning();
    return result;
}

export async function readFeedById(id: string): Promise<Feed>
{
    const [result] = await db
        .select()
        .from(feeds)
        .where(eq(feeds.id, id));
    return result;
}

export async function readFeedByUrl(url: string): Promise<Feed>
{
    const [result] = await db
        .select()
        .from(feeds)
        .where(eq(feeds.url, url));
    return result;
}

export async function readNextFeedToFetch(): Promise<Feed>
{
    const [result] = await db
        .select()
        .from(feeds)
        .orderBy(feeds.lastFetchedAt).limit(1);
    return result;
}

export async function markFeedFetched(id: string)
{
    await db
        .update(feeds)
        .set({ updatedAt: sql`NOW()`, lastFetchedAt: sql`NOW()` })

        .where(eq(feeds.id, id));
    return readFeedById(id);
}

export async function readAllFeeds() { return db.select().from(feeds);}


