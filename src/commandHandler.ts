import {setUser} from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export function handlerLogin(cmdName: string, ...args: string[]): void
{
    if (args.length === 0)
    {
        throw  new Error("Login expects a username as an argument.");
    }

    setUser(args[0])
    console.log(`User ${args[0]} logged in successfully.`);
}