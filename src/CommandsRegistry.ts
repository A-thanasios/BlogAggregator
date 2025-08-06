import { CommandHandler, UserCommandHandler } from "./commandHandler";
import { currentUser } from "./config";
import {readUserByName} from "./lib/db/queries/users";

export type CommandsRegistry = Record<string, CommandHandler>

export function registerCommand(registry: CommandsRegistry,
                                cmdName: string,
                                handler: CommandHandler): void
{
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry,
                                cmdName?: string,
                                ...args: string[]): Promise<void>
{
    if (cmdName)
        await registry[cmdName](cmdName, ...args);
    else throw new Error("No command provided.");

}

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler
{
    return async (cmdName: string, ...args: string[]): Promise<void> =>
    {
        const userName: string = currentUser();

        if (!userName) throw new Error("You must be logged in to run this command.");

        const user = await readUserByName(userName);
        if (!user) throw new Error(`User ${userName} does not exist.`);

        await handler(cmdName, user, ...args);
    };
}
