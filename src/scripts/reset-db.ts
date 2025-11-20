import { reset } from "drizzle-seed"
import { db } from "../database"
import * as schema from '../database/schema'
async function main() {

    console.log("clearing database..")
    await reset(db, schema)
    console.log("database has been cleared")
}

main()