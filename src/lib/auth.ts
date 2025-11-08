import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database"; // your drizzle instance
import * as schema from "../database/schema"
import * as authSchema from "../../auth-schema"

const schemaTables = {
    ...schema,
    ...authSchema
}
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schemaTables
    }),
    basePath: "/api",
    emailAndPassword:{
        enabled: true,
    }   
});

