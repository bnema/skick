import { migrate } from "drizzle-orm/libsql/migrator"
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/web"
import * as dotenv from 'dotenv'
dotenv.config()

export async function main() {
  const isProd = process.env.NODE_ENV === "production"

  const dbUrl = isProd
    ? process.env.VITE_TURSO_DB_PROD_URL
    : process.env.VITE_TURSO_DB_DEV_URL

  const authToken = isProd
    ? process.env.VITE_TURSO_DB_PROD_AUTH_TOKEN
    : process.env.VITE_TURSO_DB_DEV_AUTH_TOKEN

  if (!dbUrl) {
    throw new Error('VITE_TURSO_DB_URL is not defined')
  }

  const db = drizzle(
    createClient({
      url: dbUrl,
      authToken: authToken
    })
  )

  console.log('Running migrations')

  await migrate(db, { migrationsFolder: 'migrations' })

  console.log('Migrated successfully')

  process.exit(0)
}

main().catch((e) => {
  console.error('Migration failed')
  console.error(e)
  process.exit(1)
})