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


// addUserDB is a function that adds a new user to the database
export async function addUserDB(OAuthUser: OAuthUser, email: string | null, hashed_password: string | null) {
  const providerId = OAuthUser.id;
  const userId = generateId(15);
  await db.executeMultiple(`
    INSERT INTO users (id, username, avatar_url, email, hashed_password, is_active)
    VALUES ('${userId}', '${email}', '${OAuthUser.avatar_url}', '${email}', '${hashed_password}', 1);
    INSERT INTO providers (id, user_id, provider, provider_id)
    VALUES ('${generateId(15)}', '${userId}', '${OAuthUser.provider}', '${providerId}');
  `);
  await db.execute({
    sql: "UPDATE users SET created_at = strftime('%s', 'now'), updated_at = strftime('%s', 'now') WHERE id = ?",
    args: [userId]
  });

  return userId;
}



// add provider
export async function addProviderDB(userID: string, provider: Providers, providerId: string) {
  await db.execute({
    sql: "INSERT INTO providers (id, user_id, provider, provider_id) VALUES (?, ?, ?, ?)",
    args: [generateId(15), userID, provider, providerId]
  });
}

// updateUserDB is a function that updates an existing user in the database
export async function updateUserDB(OAuthUser: OAuthUser, email: string | null) {
  const providerId = OAuthUser.id;

  const existingUserResult = await db.execute({
    sql: "SELECT * FROM providers WHERE provider_id = ?",
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
    hashed_password: row.hashed_password as string,
    providers: [],
    avatar_url: row.avatar_url as string | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    isAdmin: row.is_admin as number,
    isActive: row.is_active as number,
    verified_email: row.verified_email as number
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

// getUserByEmail is a function that gets a user by their email and return the user
export async function getUserByEmail(email: string) {
  const userResult = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email]
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
    hashed_password: row.hashed_password as string,
    providers: [],
    avatar_url: row.avatar_url as string | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    isAdmin: row.is_admin as number,
    isActive: row.is_active as number,
    verified_email: row.verified_email as number
  };

  return user;
}

// isEmailVerified is a function that checks if a user's email is verified
export async function isEmailVerified(userID: string) {
  const userResult = await db.execute({
    sql: "SELECT verified_email FROM users WHERE id = ?",
    args: [userID]
  });

  if (userResult.rows.length === 0) {
    return false;
  }

  return userResult.rows[0].verified_email === 1;
}


// emailVerified is a function that sets a user's email as verified
export async function emailVerified(userID: string) {
  await db.execute({
    sql: "UPDATE users SET verified_email = 1 WHERE id = ?",
    args: [userID]
  });
}