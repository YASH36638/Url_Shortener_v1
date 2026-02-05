// import { timestamp } from "drizzle-orm/gel-core";
import {boolean,int,mysqlTable,varchar,timestamp, mysqlEnum} from "drizzle-orm/mysql-core";
import { sql,relations } from "drizzle-orm";
import { text } from "drizzle-orm/gel-core";

// export const usersTable = mysqlTable("users _table",{
//     id:serial().primaryKey(),

//     name:varchar({length:255}).notNull(),
//     age:int().notNull(),
//     email:varchar({length:255}).
//     notNull().unique(),
// })

export const shortLinksTable=mysqlTable("short_link",{
id:int().autoincrement().primaryKey(),
url:varchar({length:255}).notNull(),
shortCode:varchar({length:255}).notNull(),
createdAt:timestamp("created_at").defaultNow().notNull(),
updatedAt:timestamp("updated_at").defaultNow().$onUpdateFn().notNull(),
userId:int('user_id').notNull().references(()=>Users.id),
});

export const Users=mysqlTable("users",{
id:int().autoincrement().primaryKey().notNull(),
name:varchar({length:255}).notNull(),
Validemail:boolean("is_email_valid").default(false).notNull(),
password:varchar({length:255}),
avatarUrl:text("avatarUrl"),
email:varchar({length:255}).notNull().unique(),
createdAt:timestamp("created_at").defaultNow().notNull(),
updatedAt:timestamp("updated_at").defaultNow().$onUpdateFn().notNull(),
});

export const sessionsTable=mysqlTable("sessions",{
id:int().autoincrement().primaryKey().notNull(),
userId:int('user_id').notNull().references(()=>Users.id),
valid:boolean().default(true).notNull(),
ip:varchar({length:255}).notNull(),
userAgent:varchar({length:255}).notNull(),
createdAt:timestamp("created_at").defaultNow().notNull(),
expiresAt:timestamp("expires_at").defaultNow().onUpdateNow().notNull(),
});

export const VerifyEmailTokens=mysqlTable("verify_email_tokens",{
id: int("id").autoincrement().primaryKey(),
userId: int("user_id").notNull().references(() => Users.id),
token: varchar("token", { length: 8 }).notNull().unique(),
createdAt: timestamp("created_at").defaultNow().notNull(),
expiresAt: timestamp("expires_at").notNull(),
});

export const oauthAccountsTable=mysqlTable("oauth_accounts",{
id:int("id").autoincrement().primaryKey(),
UserId:int("user_id").notNull().references(()=>Users.id,{onDelete:"cascade"}),
provider:mysqlEnum("provider",["google","github"]).notNull(),
providerAccountId:varchar("provider_account_id",{length:255}).notNull().unique(),
createdAt:timestamp("created_at").defaultNow().notNull(),
});

export const usersRelation = relations(Users,({many})=>({
shortLinks:many(shortLinksTable),
sessions:many(sessionsTable),
}));

export const LinkRelation = relations(shortLinksTable,({one})=>({
user:one(Users,
    {
        fields:[shortLinksTable.userId],
        references:[Users.id]
    })
}));

export const sessionRelation = relations(sessionsTable,({one})=>({
user:one(Users,
    {
        fields:[sessionsTable.userId],
        references:[Users.id]
    })
}));




export const passwordResetTokensTable=mysqlTable("password_reset_tokens",{
id:int("id").autoincrement().primaryKey(),
userId:int("user_id").notNull().references(()=>Users.id,{onDelete:"cascade"}).unique(),
tokenHash:text("token_hash").notNull(),
createdAt:timestamp("created_at").defaultNow().notNull(),
expiresAt:timestamp("expires_at").default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`).notNull(),
});