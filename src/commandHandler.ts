import { currentUser, setUser } from "./config";
import { createUser, readAllUsers, readUserByName, resetTableUsers, User } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/api/RSSFeed";
import {createFeed, Feed, readAllFeeds, readFeedByUrl} from "./lib/db/queries/feeds";
import {createFeedFollow, deleteFeedFollow, readFeedFollowsForUser} from "./lib/db/queries/follow";

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
{   try {
    console.log(JSON.stringify(await fetchFeed('https://www.wagslane.dev/index.xml')));
        }
        catch (error) { console.log(error); }
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

function printFeed(feed: Feed, user: User): void
{
    console.log(JSON.stringify(feed));
    console.log(JSON.stringify(user));
}