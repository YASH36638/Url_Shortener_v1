import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";


export const providerEnum = pgEnum("provider", ["google", "github"]);


export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isEmailValid: boolean("is_email_valid").default(false).notNull(),
  password: varchar("password", { length: 255 }),
  avatarUrl: text("avatar_url"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const shortLinksTable = pgTable("short_links", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 255 }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  valid: boolean("valid").default(true).notNull(),
  ip: varchar("ip", { length: 255 }).notNull(),
  userAgent: varchar("user_agent", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const verifyEmailTokens = pgTable("verify_email_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 8 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const oauthAccountsTable = pgTable("oauth_accounts", {
  id: serial("id").primaryKey(),
  UserId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  provider: providerEnum("provider").notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" })
    .unique(),
  tokenHash: text("token_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL '1 hour')`)
    .notNull(),
});



export const usersRelation = relations(Users, ({ many }) => ({
  shortLinks: many(shortLinksTable),
  sessions: many(sessionsTable),
}));

export const linkRelation = relations(shortLinksTable, ({ one }) => ({
  user: one(Users, {
    fields: [shortLinksTable.userId],
    references: [Users.id],
  }),
}));

export const sessionRelation = relations(sessionsTable, ({ one }) => ({
  user: one(Users, {
    fields: [sessionsTable.userId],
    references: [Users.id],
  }),
}));
