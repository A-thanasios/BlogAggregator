import {CommandHandler} from "./commandHandler";

export type CommandsRegistry =
    {
        [commandName: string]: (...args: string[]) => void;
    }

export function registerCommand(registry: CommandsRegistry,
                                cmdName: string,
                                handler: CommandHandler): void
{
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry,
                                cmdName: string,
                                ...args: string[]): void
{
    registry[cmdName](cmdName, ...args);
}