import {drizzle} from "drizzle-orm/mysql2";
import 'dotenv/config';
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
});

export const db = drizzle(pool);
// export const db=drizzle(process.env.DATABASE_URI);