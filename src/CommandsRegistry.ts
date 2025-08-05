import {CommandHandler} from "./commandHandler";

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