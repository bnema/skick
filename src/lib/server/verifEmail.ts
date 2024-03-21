import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { tursoClient } from "./db/turso";
import { generateId } from "lucia";
import type { User } from "./db/schema";

const db = tursoClient();

export async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {

  console.log("generateEmailVerificationCode", userId, email);
  // Check if the user exists
  const user = await db.execute({
    sql: "SELECT id FROM users WHERE id = ?",
    args: [userId]
  });

  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  await db.execute({
    sql: "DELETE FROM email_verifications WHERE user_id = ?",
    args: [userId]
  });

  const code = generateRandomString(8, alphabet("0-9"));
  const verifID = generateId(15);

  await db.execute({
    sql: "INSERT INTO email_verifications (id, user_id, email, code, expires_at) VALUES (?, ?, ?, ?, ?)",
    args: [verifID, userId, email, code, createDate(new TimeSpan(15, "m")).toISOString()]
  });

  return code;
}
export async function verifyVerificationCode(user: string, code: string): Promise<boolean> {
  const databaseCode = await db.execute({
    sql: "SELECT * FROM email_verifications WHERE user_id = ?",
    args: [user]
  });
  // get the email from db users.email
  const email = await db.execute({
    sql: "SELECT email FROM users WHERE id = ?",
    args: [user]
  });


  if (databaseCode.rows.length === 0 || databaseCode.rows[0].code !== code) {
    return false;
  }

  const expiresAt = databaseCode.rows[0].expires_at;
  if (expiresAt !== null && !isWithinExpirationDate(expiresAt.toString())) {
    return false;
  }

  // compare email from db with email from email_verifications
  if (email.rows[0].email !== databaseCode.rows[0].email) {
    return false;
  }

  // delete the code from email_verifications
  await db.execute({
    sql: "DELETE FROM email_verifications WHERE user_id = ?",
    args: [user]
  });

  // set the verified email in users to true
  await db.execute({
    sql: "UPDATE users SET verified_email = 1 WHERE id = ?",
    args: [user]
  });

  return true;
}

function isWithinExpirationDate(expiresAt: string): boolean {
  const expirationDate = new Date(expiresAt);
  const currentDate = new Date();
  return currentDate <= expirationDate;
}