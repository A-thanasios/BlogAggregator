import {db} from "../index";
import {feed_follows, posts} from "../schema";
import {Feed} from "./feeds";
import {asc, desc, eq} from "drizzle-orm";
import {timestamp} from "drizzle-orm/pg-core";

export type Post = typeof posts.$inferSelect;

export async function createPost(
    title: string, url: string, published: string, feedId: string,
    description?: string): Promise<Post>
{
    const [result] = await db
        .insert(posts)
        .values({   title: title,
            url: url,
            description: description,
            published: new Date(published),
            feedId: feedId
        }).onConflictDoNothing({
            target: [posts.url, posts.feedId],})
        .returning();
    return result;
}

export async function readPostsForUser(userId: string, amount: number, ascended: boolean= false): Promise<Post[]>
{
    return db
        .select()
        .from(posts)
        .where(eq(posts.feedId, db
                .select({feedId: feed_follows.feedId})
                .from(feed_follows)
                .where(eq(feed_follows.userId, userId)
        )))
        .limit(amount)
        .orderBy(ascended? asc(posts.published): desc(posts.published));
}