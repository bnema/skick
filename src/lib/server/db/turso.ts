import { createClient } from "@libsql/client"

export function tursoClient() {
    const isProd = import.meta.env.MODE === "production"

    const url = isProd
        ? import.meta.env.VITE_TURSO_DB_PROD_URL?.trim()
        : import.meta.env.VITE_TURSO_DB_DEV_URL?.trim()

    if (url === undefined) {
        throw new Error('VITE_TURSO_DB_URL is not defined')
    }

    const authToken = isProd
        ? import.meta.env.VITE_TURSO_DB_PROD_AUTH_TOKEN?.trim()
        : import.meta.env.VITE_TURSO_DB_DEV_AUTH_TOKEN?.trim()

    if (authToken === undefined) {
        if (!url.includes('file:')) {
            throw new Error('VITE_TURSO_DB_AUTH_TOKEN is not defined')
        }
    }

    return createClient({ url, authToken })
}