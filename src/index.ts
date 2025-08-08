import * as process from "node:process";

import {CommandsRegistry, middlewareLoggedIn, registerCommand, runCommand} from "./commandsRegistry";
import {
    handlerAddFeed,
    handlerAgg, handlerBrowse,
    handlerFeeds, handlerFollow, handlerFollowing,
    handlerLogin,
    handlerRegister,
    handlerReset, handlerUnfollow,
    handlerUsers
} from "./commandHandler";

async function main(): Promise<void>
{
    const registry: CommandsRegistry = {};

    registerCommand(registry, 'login', handlerLogin);
    registerCommand(registry, 'register', handlerRegister);
    registerCommand(registry, 'reset', handlerReset);
    registerCommand(registry, 'users', handlerUsers);
    registerCommand(registry, 'agg', handlerAgg);
    registerCommand(registry, 'addfeed', middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, 'feeds', handlerFeeds);
    registerCommand(registry, 'follow', middlewareLoggedIn(handlerFollow));
    registerCommand(registry, 'following', middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, 'unfollow', middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, 'browse', middlewareLoggedIn(handlerBrowse));

    const input = process.argv.slice(2);

    if (input.length === 0)
    {
        console.error("No command provided.");
        process.exit(1);
    }

    const cmd :string|undefined = input.shift();

    await runCommand(registry, cmd, ...input);

    process.exit(0);
}

main();