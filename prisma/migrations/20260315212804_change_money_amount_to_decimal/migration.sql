-- AlterTable
ALTER TABLE "public"."course_meta_drafts" ALTER COLUMN "priceAmount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."invoices" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
