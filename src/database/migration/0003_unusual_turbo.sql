ALTER TABLE "budgets" ALTER COLUMN "budgeted_amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "spent_amount" numeric(15, 2) DEFAULT 0;