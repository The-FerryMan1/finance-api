import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database"; // your drizzle instance
import * as schema from "../database/schema"
import * as authSchema from "../../auth-schema"

import {openAPI} from 'better-auth/plugins'

const schemaTables = {
    ...schema,
    ...authSchema
}
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schemaTables
    }),
    plugins: [
        openAPI()
    ],
    trustedOrigins: [
        'http://localhost:3000', // Your server URL
        'http://localhost:5173', // Your client dev URL (Vite default, etc.)
    ],
    basePath: "/auth",
    emailAndPassword:{
        enabled: true,
    }   
});

