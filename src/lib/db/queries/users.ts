import { eq } from "drizzle-orm";

import { db } from "..";
import { users } from "../schema";

export type User = typeof users.$inferSelect;

export async function createUser(name: string) {
    const [result] = await db
        .insert(users)
        .values({ name: name })
        .returning();
    return result;
}

export async function readUserByName(name: string)
{
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.name, name));
    return result;
}

export async function readUserById(id: string)
{
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
    return result;
}

export async function readAllUsers() { return db.select().from(users);}

export async function resetTableUsers() { await db.delete(users) }