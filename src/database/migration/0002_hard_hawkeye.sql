ALTER TABLE "budgets" ADD COLUMN "budgeted_amount" numeric(15, 2) DEFAULT 0;--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN "budgetated_amount";