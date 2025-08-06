import { db } from "..";
import { feeds } from "../schema";
import { eq } from "drizzle-orm";

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

export async function readAllFeeds() { return db.select().from(feeds);}
