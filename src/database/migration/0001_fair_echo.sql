ALTER TYPE "public"."transaction_type" ADD VALUE 'Reverted';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;