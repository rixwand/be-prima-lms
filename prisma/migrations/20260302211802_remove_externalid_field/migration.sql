/*
  Warnings:

  - You are about to drop the column `externalId` on the `invoices` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."invoices_externalId_key";

-- AlterTable
ALTER TABLE "public"."invoices" DROP COLUMN "externalId";
