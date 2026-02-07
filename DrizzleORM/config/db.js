
import { drizzle } from "drizzle-orm/postgres-js";
import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL;

const client = postgres(connectionString,
    {
        ssl:"require",
        prepare:false,
    }
);

export const db = drizzle(client);
