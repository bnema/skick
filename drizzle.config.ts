import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"
dotenv.config()

const isProd = process.env.NODE_ENV === "production"

export default {
    schema: "./src/lib/server/db/schema.ts",
    out: "./migrations",
    driver: "turso",
    dbCredentials: {
        url: isProd ? process.env.VITE_TURSO_DB_PROD_URL ?? "" : process.env.VITE_TURSO_DB_DEV_URL ?? "",
        authToken: isProd ? process.env.VITE_TURSO_DB_PROD_AUTH_TOKEN : process.env.VITE_TURSO_DB_DEV_AUTH_TOKEN,
    },
} satisfies Config