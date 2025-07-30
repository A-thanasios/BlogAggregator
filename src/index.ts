import * as process from "node:process";

import {CommandsRegistry, registerCommand, runCommand} from "./CommandsRegistry";
import { handlerLogin } from "./commandHandler";

function main()
{
    const registry: CommandsRegistry = {};

    registerCommand(registry, 'login', handlerLogin);

    const input = process.argv.slice(2);

    if (input.length === 0)
    {
        console.error("No command provided.");
        process.exit(1);
    }

    const cmd = input.shift();

    runCommand(registry, cmd, ...input);
}

main();