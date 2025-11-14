ALTER TABLE "transaction" ALTER COLUMN "type" SET DEFAULT 'original';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "type" SET NOT NULL;