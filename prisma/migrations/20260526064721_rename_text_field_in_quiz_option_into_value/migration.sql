/*
  Warnings:

  - You are about to drop the column `text` on the `quiz_options` table. All the data in the column will be lost.
  - Added the required column `value` to the `quiz_options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz_options" DROP COLUMN "text",
ADD COLUMN     "value" TEXT NOT NULL;
