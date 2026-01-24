// import { timestamp } from "drizzle-orm/gel-core";
import {boolean,int,mysqlTable,varchar,timestamp} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

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
password:varchar({length:255}).notNull(),
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