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
    email: text('email').notNull().unique(),
    hashed_password: text('hashed_password'),
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

// Provider table linked through user_id with : id / user_id / provider / provider_id
export const ProviderTable = sqliteTable(
  'providers',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    provider: text('provider').notNull(),
    providerId: text('provider_id').notNull(),
  },
  (table) => ({
    pk: primaryKey({ name: 'pk_providers', columns: [table.id] }),
    fk_user: foreignKey({
      name: 'fk_providers_users',
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }),
  }),
);

// email_verifified table linked through user_id with : id / code / user_id / email / expires_at 
export const EmailVerificationTable = sqliteTable(
  'email_verifications',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    userId: text('user_id').notNull(),
    email: text('email').notNull(),
    expiresAt: integer('expires_at').notNull(),
  },
  (table) => ({
    pk: primaryKey({ name: 'pk_email_verifications', columns: [table.id] }),
    fk_user: foreignKey({
      name: 'fk_email_verifications_users',
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }),
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
  avatar_url: string | null;
  createdAt: number;
  updatedAt: number;
  isAdmin: number;
  isActive: number;
  sessions?: Session[];
  providers?: Provider[];
  emailVerifications?: EmailVerification[];
}

// Define the Session model
export interface Session extends InferSelectModel<typeof SessionTable> {
    id: string;
    userId: string;
    expiresAt: number;
    fresh: number;
}


// Define the Provider model
export interface Provider extends InferSelectModel<typeof ProviderTable> {
    id: string;
    userId: string;
    provider: string;
    providerId: string;
}

// Define the EmailVerification model
export interface EmailVerification extends InferSelectModel<typeof EmailVerificationTable> {
    id: string;
    code: string;
    userId: string;
    email: string;
    expiresAt: number;
}