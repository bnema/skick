import { sql, type InferSelectModel } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  foreignKey,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

// Define the User table
export const UserTable = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    email: text('email').notNull(),
    google_id: text('google_id'),
    discord_id: text('discord_id'),
    avatar_url: text('avatar_url'),
    createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
    isAdmin: integer('is_admin').default(0),
    isActive: integer('is_active').default(1),
  },
  (table) => ({
    pk: primaryKey({ name: 'pk_users', columns: [table.id] }),
  }),
);

// Define the Session table
export const SessionTable = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: integer('expires_at').notNull(),
    fresh: integer('fresh').default(0),
  },
  (table) => ({
    pk: primaryKey({ name: 'pk_sessions', columns: [table.id] }),
    fk_user: foreignKey({
      name: 'fk_sessions_users',
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }),
  }),
);

// Define the User model
export interface User extends InferSelectModel<typeof UserTable> {
  id: string;
  username: string;
  email: string;
  discord_id: string | null;
  google_id: string | null;
  avatar_url: string | null;
  createdAt: number;
  updatedAt: number;
  isAdmin: number;
  isActive: number;
  sessions?: Session[];
}

// Define the Session model
export interface Session extends InferSelectModel<typeof SessionTable> {
    id: string;
    userId: string;
    expiresAt: number;
    fresh: number;
}