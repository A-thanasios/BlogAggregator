import { currentUser, setUser } from "./config";
import { createUser, readAllUsers, readUserByName, resetTableUsers, User } from "./lib/db/queries/users";
import { fetchFeed, RSSFeed } from "./lib/api/RSSFeed";
import {
    createFeed,
    Feed,
    markFeedFetched,
    readAllFeeds,
    readFeedByUrl,
    readNextFeedToFetch
} from "./lib/db/queries/feeds";
import {createFeedFollow, deleteFeedFollow, readFeedFollowsForUser} from "./lib/db/queries/follow";
import {createPost, Post, readPostsForUser} from "./lib/db/queries/posts";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void>
{
    if (args.length === 0) throw  new Error("Login expects a username as an argument.");

    const user = await readUserByName(args[0]);
    if (user)
    {
        setUser(args[0])
        console.log(`User ${args[0]} logged in successfully.`);
    }
    else throw new Error(`User ${args[0]} does not exist.`);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void>
{
    if (args.length === 0) throw  new Error("Register expects a name as an argument.");

    try
    {
        const user = await createUser(args[0]);
        setUser(user.name);
        console.log(user);
    }
    catch (error)
    {
        throw error;
    }
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void>
{
    try
    {
        const users = await readAllUsers();
        if (users)
        {
            const currUser: string = currentUser();

           for (const user of users)
           {
               if (user.name === currUser)
                    console.log(`* ${user.name} (current)`);
               else
                    console.log(`* ${user.name}`);
           }
        }
        else
        {
            console.log("No users found.");
        }
    }
    catch (error)
    {
        throw new Error(`Failed to retrieve users: ${error}`);
    }
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void>
{
    try
    {
        await resetTableUsers();
        console.log("Database reset successfully.");
    }
    catch (error)
    {
        throw new Error(`Failed to reset database: ${error}`);
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void>
{
    if (args.length < 1) throw new Error("Agg expects a dur between fetches as an argument.");

    try {
            const timeBetweenRequests: number | undefined = parseDuration(args[0]);
            console.log(`Collecting feeds every ${args[0]}`);

        await scrapeFeeds();

        const interval = setInterval(() => {
            scrapeFeeds();
        }, timeBetweenRequests);

        await new Promise<void>((resolve) => {
            process.on("SIGINT", () => {
                console.log("Shutting down feed aggregator..." + timeBetweenRequests);
                clearInterval(interval);
                resolve();
            });
        });

        } catch (error) { console.log(error); }
}

export async function handlerAddFeed(_: string, user: User, ...args: string[]): Promise<void>
{
    if (args.length < 2) throw  new Error("Add Feed expects a name and an url as an argument.");
    try
    {
        const feed: Feed = await createFeed(args[0], args[1], user.id);

        await handlerFollow(_, user, feed.url);
    } catch (error) { console.log(error); }
}

export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void>
{   try {
    const feeds: Feed[] = await readAllFeeds();
    const users: User[] = await readAllUsers();
    for (const feed of feeds)
    {
        if (!feed) continue;
        for (const user of users)
        {
            if (!user) continue;
            if (feed.userId === user.id)
                console.log(`* ${feed.name} *\n  - ${feed.url}\n  - ${user.name}`)
                delete feeds[feeds.indexOf(feed)];
        }
    }
}
catch (error) { console.log(error); }
}

export async function handlerFollow(_: string, user: User, ...args: string[]): Promise<void>
{
    if (args.length < 1) throw  new Error("Follow expects an url as an argument.");
    try
    {
        const feed: Feed = await readFeedByUrl(args[0]);

        const follow = await createFeedFollow(user.id, feed);

        console.log(follow.feed.name);
        console.log(currentUser());
    } catch(error) { console.log(error); }
}

export async function handlerFollowing(_: string, user: User, ...args: string[]): Promise<void>
{
    try
    {
        const feeds = await readFeedFollowsForUser(user.id);

        for (const feed of feeds) {
            if (!feed) continue;
            console.log(`* ${feed.name} *\n  - ${feed.url}`);
        }
    } catch (error) { console.log(error); }
}

export async function handlerUnfollow(_: string, user: User, ...args: string[]): Promise<void>
{
    if (args.length < 1) throw new Error("Unfollow expects a url as an argument.");

    try
    {
        const feed: Feed = await readFeedByUrl(args[0]);
        await deleteFeedFollow(user.id, feed.id);
    } catch (error) { console.log(error); }
}

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]): Promise<void>
{
    try
    {
        const limit: number = args.length > 0 && parseInt(args[0])? parseInt(args[0], 10) : 2;
        const ascended: boolean = args.length > 0 && (args[0] === 'asc' || args[0] === 'ascending');

        const posts: Post[] = await readPostsForUser(user.id, limit, ascended);
        if (posts.length === 0)
        {
            console.log("No posts found.");
            return;
        }
        for (const post of posts)
        {
            console.log(`* ${post.title} *\n  - ${post.url}\n  - ${post.published.toISOString()}`);
            if (post.description) {
                console.log(`  - ${post.description}`);
            }
        }
    } catch (error) { console.log(error); }
}

function parseDuration(durationStr: string): number | undefined
{
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if (!match) return;

    if (match.length !== 3) return;

    if (!match) throw new Error("Invalid duration format. Use 'ms', 's', 'm', or 'h'.");

    return parseInt(match[1], 10) *
        (match[2] === 'h' ? (360 * 360 * 1000):
            match[2] === 'm' ? (360 * 1000):
                match[2] === 's' ? 1000: 1) ;
}

function printFeed(feed: Feed, user: User): void
{
    console.log(JSON.stringify(feed));
    console.log(JSON.stringify(user));
}

async function scrapeFeeds()
{
    const nextFeed: Feed = await readNextFeedToFetch();
    await markFeedFetched(nextFeed.id);

    const feed = await fetchFeed(nextFeed.url)

    await createPost(
        feed.channel.title,
        nextFeed.url,
        new Date(feed.channel.item[0].pubDate).toISOString(),
        nextFeed.id,
        feed.channel.description
    )
}