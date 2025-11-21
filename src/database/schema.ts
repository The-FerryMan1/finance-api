import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  AnyPgColumn,
  numeric,
  date,
  char,
  PgTable,
} from "drizzle-orm/pg-core";
import { user } from "../../auth-schema";


export enum FinancialAccountType {
  Checking = "Checking",
  Savings = "Savings",
  Credit_card = "Credit card",
  Cash = "Cash",
  Invenstment = "Investment",
  Loan = "Loan"
}

export const AccountType = pgEnum('account_type',
  [
    FinancialAccountType.Checking,
    FinancialAccountType.Savings,
    FinancialAccountType.Credit_card,
    FinancialAccountType.Invenstment,
    FinancialAccountType.Loan,
    FinancialAccountType.Cash
  ]
)

export enum CategoryTypeEnum {
  Income = "Income",
  Expense = "Expense"
}



export const CategoryType = pgEnum('Category_type',
  [
    CategoryTypeEnum.Income,
    CategoryTypeEnum.Expense,
  ]
)

export enum TrasanctionStatusType {
  Pending = "Pending",
  Cleared = "Cleared",
  Reconciled = "Reconciled"
}



export const TrasanctionStatusEnum = pgEnum('transaction_type',
  [
    TrasanctionStatusType.Cleared,
    TrasanctionStatusType.Pending,
    TrasanctionStatusType.Reconciled,
  ]
)


export enum BudgetsCycleType {
  Monthly = "Monthly",
  Weekly = "Weekly",
  Annual = "Annual",
  Once = "Once"
}



export const BudgetsCycleEnum = pgEnum('cycle_type',
  [
    BudgetsCycleType.Monthly,
    BudgetsCycleType.Weekly,
    BudgetsCycleType.Annual,
    BudgetsCycleType.Once,
  ]
)

export enum GoalType {
  Savings = "Savings",
  DebtPayoff = "Debt Payoff",
}



export const GoalTypeEnum = pgEnum('cycle_type',
  [
    GoalType.Savings,
    GoalType.DebtPayoff,
  ]
)



export const FinancialAccount = pgTable("financial_account", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  accountType: AccountType('account_type').notNull(),
  institution: varchar("institution", { length: 100 }),
  currentBalance: numeric('current_balance', { mode: "number", precision: 15, scale: 2 }).notNull(),
  lastSynced: timestamp('last_synced'),
})

export const Categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  categoryYype: CategoryType("category_type").notNull(),
  parentID: integer("parent_id").references((): AnyPgColumn => Categories.id)
})

export const Transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  categoryID: integer('category_id').references(() => Categories.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  amount: numeric('amount', { mode: "number", precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  status: TrasanctionStatusEnum("status").default(TrasanctionStatusType.Cleared),
  originalCurrency: char("original_currency", { length: 3 }),
  receiptURL: varchar("receipt_url", { length: 255 })
})

export const Budgets = pgTable("budgets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  categoryID: integer('category_id').references(() => Categories.id, { onDelete: "cascade" }),
  cycle: BudgetsCycleEnum("cycle").notNull(),
  stateDate: date("start_date").notNull(),
  budgetatedAmount: numeric("budgetated_amount", { mode: "number", precision: 15, scale: 2 })
})

export const Goals = pgTable("goals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  goalName: varchar("goal_name", { length: 100 }).notNull(),
  goalType: GoalTypeEnum("goal_type").notNull(),
  targetAmount: numeric('target_amount', { mode: "number", precision: 15, scale: 2 }).notNull(),
  targetDate: date("target_date"),
  currentValue: numeric('target_amount', { mode: "number", precision: 15, scale: 2 }).notNull().default(0.00),
})
