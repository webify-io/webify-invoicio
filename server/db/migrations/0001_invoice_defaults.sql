ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "default_payment_term" "payment_term" DEFAULT 'net_30';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invoice_prefix" text DEFAULT 'INV';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "default_notes" text;
