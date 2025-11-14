import { doublePrecision, integer, pgEnum, pgTable, text, timestamp, varchar,boolean } from "drizzle-orm/pg-core";
import { user } from '../../auth-schema'



export enum CategoryType {
    INCOME= 'income',
    EXPENSE = 'expense'
}

export enum TransactionType {
    ORIGINAL= 'original',
    MODIFIED = 'modified'
}

export const TransactionEnum = pgEnum("transaction_type", [
    TransactionType.ORIGINAL,
    TransactionType.MODIFIED
] as const)

export const categoryEnum = pgEnum("category_type", [
    CategoryType.EXPENSE,
    CategoryType.INCOME
] as const)

export const balance = pgTable('balance', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userID: text('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAT: timestamp("created_at").defaultNow(),
    currentBalance: doublePrecision('current_balance').notNull().default(0),
    trash: boolean('trash').notNull().default(false),
    balanceType: varchar('balance_type', {length:255})
})

export const category = pgTable('category', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userID: text('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
    name: varchar('name', { length: 255 }).notNull().default("unamaed"),
    trash: boolean('trash').notNull().default(false),
    type: categoryEnum().notNull().default(CategoryType.EXPENSE)
})

export const transaction = pgTable('transaction', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userID: text('user_id').notNull().references(() => user.id, { onDelete: "cascade" }),
    balanceID: integer('balance_id').notNull().references(() => balance.id, { onDelete: 'cascade' }),
    categoryID: integer('category_id').notNull().references(() => category.id, { onDelete: 'cascade' }),
    amount: doublePrecision('amount').notNull(),
    description: varchar("description", { length: 255 }).default("no description"),
    type:TransactionEnum().notNull().default(TransactionType.ORIGINAL),
    trash: boolean('trash').notNull().default(false),
    date: timestamp("date").defaultNow(),
})