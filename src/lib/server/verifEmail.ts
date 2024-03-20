import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { tursoClient } from "./db/turso";

const db = tursoClient();

export async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {

  await db.execute({
    sql: "DELETE FROM email_verification_code WHERE user_id = ?",
    args: [userId]
  });

  const code = generateRandomString(8, alphabet("0-9"));

await db.execute({
    sql: "INSERT INTO email_verification_code (user_id, email, code, expires_at) VALUES (?, ?, ?, ?)",
    args: [userId, email, code, createDate(new TimeSpan(15, "m")).toISOString()]
  });

  return code;
}

