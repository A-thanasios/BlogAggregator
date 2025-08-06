import { eq } from "drizzle-orm";

import { db } from "..";
import { feed_follows } from "../schema";
import { readUserById } from "./users";
import {Feed, readFeedById} from "./feeds";

export type Follow =
    {
        follow: typeof feed_follows.$inferSelect,
        feed: Feed,
        userNames: Array<string>
    }

export async function createFeedFollow(user_id: string, feed: Feed): Promise<Follow>
{
    const [result] = await db
        .insert(feed_follows)
        .values({   userId: user_id,
                    feedId: feed.id,
        })
        .returning();
    const userNames: string[] = [];
    const userIds: string[] = [];
    Promise.all(await readFeedFollowers(feed.id)).then((follower) => userIds.push(JSON.stringify(follower)));
    for (const userId of userIds)
    {
       const user = await readUserById(userId);
       userNames.push(user.name);
    }
    return { follow: result, feed, userNames };
}

export async function readFeedFollowers(feed_id: string)
{
    return db
        .select({ userId: feed_follows.userId })
        .from(feed_follows)
        .where(eq(feed_follows.feedId, feed_id))
}

export async function readFeedFollowsForUser(user_id: string) {
    const feeds = await readFeedsByUserId(user_id);
    return Promise.all(feeds.map(feed => readFeedById(feed.feedId)));
}

export async function readFeedsByUserId(user_id: string)
{
    return db
        .select({ feedId: feed_follows.feedId })
        .from(feed_follows)
        .where(eq(feed_follows.userId, user_id))
}

export async function deleteFeedFollow(user_id: string, feed_id: string): Promise<void>
{
    await db
        .delete(feed_follows)
        .where(eq(feed_follows.userId, user_id) && eq(feed_follows.feedId, feed_id));
}
