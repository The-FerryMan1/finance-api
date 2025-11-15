ALTER TABLE "transaction" DROP CONSTRAINT "transaction_reverted_id_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_reverted_id_transaction_id_fk" FOREIGN KEY ("reverted_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;