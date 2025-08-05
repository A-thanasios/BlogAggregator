import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";

export type Config =
    {
        dbUrl: string,
        currentUserName: string,
    }

export function setUser(userName: string): void
{
        const config: Config = readConfig();
        config.currentUserName = userName;
        fs.writeFileSync(getConfigFilePath(),
            JSON.stringify(config, null, 2));
}
export function currentUser(): string { return readConfig().currentUserName; }

export function readConfig(): Config
    {
        return validateConfig(fs.readFileSync(getConfigFilePath(), "utf8"));
    }

function getConfigFilePath(): string
{
    return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: string): Config
{
    try
    {
        return JSON.parse(rawConfig) as Config;
    }
    catch (error)
    {
        throw error;
    }
}