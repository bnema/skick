// src/lib/server/db/queries.ts
import { generateId } from "lucia";
import { tursoClient } from "$lib/server/db/turso";
import { Providers } from "$lib/server/auth";
import type { User } from '$lib/server/db/schema';
const db = tursoClient();

export interface OAuthUser {
  provider: Providers;
  id: string;
  login: string;
  avatar_url: string;
  email?: string;
};

// Append _id to the provider to get the field name
function getProviderField(provider: Providers): string {
  return `${provider}_id`;
}

// addUserDB is a function that adds a new user to the database
export async function addUserDB(OAuthUser: OAuthUser, email: string | null) {
  const providerId = OAuthUser.id;
  const providerField = getProviderField(OAuthUser.provider);
  const userId = generateId(15);

  await db.execute({
    sql: `INSERT INTO users (id, ${providerField}, username, avatar_url, email) VALUES (?, ?, ?, ?, ?)`,
    args: [userId, providerId, OAuthUser.login, OAuthUser.avatar_url, email]
  });

  await db.execute({
    sql: "UPDATE users SET created_at = strftime('%s', 'now'), updated_at = strftime('%s', 'now') WHERE id = ?",
    args: [userId]
  });

  return userId;
}

// updateUserDB is a function that updates an existing user in the database
export async function updateUserDB(OAuthUser: OAuthUser, email: string | null) {
  const providerId = OAuthUser.id;
  const providerField = getProviderField(OAuthUser.provider);

  const existingUserResult = await db.execute({
    sql: `SELECT * FROM users WHERE ${providerField} = ?`,
    args: [providerId]
  });

  if (existingUserResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const existingUser = existingUserResult.rows[0];
  const userId = existingUser.id?.toString() ?? generateId(15);

  await db.execute({
    sql: "UPDATE users SET username = ?, avatar_url = ?, updated_at = strftime('%s', 'now'), is_active = ?, email = ? WHERE id = ?",
    args: [OAuthUser.login, OAuthUser.avatar_url, 1, email, userId]
  });

  return userId;
}

// getUserBySessionID is a function that gets a user by their session ID
export async function getUserBySessionID(sessionID: string) {
  const sessionResult = await db.execute({
    sql: "SELECT user_id FROM sessions WHERE id = ?",
    args: [sessionID]
  });

  if (sessionResult.rows.length === 0) {
    return null;
  }

  const userID = sessionResult.rows[0].user_id;

  const userResult = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [userID]
  });

  if (userResult.rows.length === 0) {
    return null;
  }

  const row = userResult.rows[0];

  // Create a User object from the row data
  const user: User = {
    id: row.id as string,
    username: row.username as string,
    email: row.email as string,
    discord_id: row.discord_id as string | null,
    google_id: row.google_id as string | null,
    avatar_url: row.avatar_url as string | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    isAdmin: row.is_admin as number,
    isActive: row.is_active as number,
  };

  return user;
}

// getUserByID is a function that gets a user by their ID
export async function getUserByID(userID: string) {
  const userResult = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [userID]
  });

  if (userResult.rows.length === 0) {
    return null;
  }

  
}
