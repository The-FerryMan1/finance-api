import { doublePrecision, integer, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from '../../auth-schema'

export const categoryEnum = pgEnum('type', ['INCOME', 'EXPENSE'])
export const balance = pgTable('balance', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userID: integer('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAT: timestamp("created_at").defaultNow(),
    currentBalance: doublePrecision('current_balance').notNull().default(0)
})

export const category = pgTable('category', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userID: integer('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
    name: varchar('name', { length: 255 }).notNull().default("unamaed"),
    type: categoryEnum().notNull(),
})

export const transaction = pgTable('transaction', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userID: integer('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
    balanceID: integer('balance_id').notNull().references(() => balance.id, { onDelete: 'cascade' }),
    categoryID: integer('category_id').notNull().references(() => category.id, { onDelete: 'cascade' }),
    amount: doublePrecision('amount').notNull(),
    description: varchar("description", { length: 255 }).default("no description"),
    date: timestamp("date").defaultNow(),
})