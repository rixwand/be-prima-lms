/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `quiz_attempt_answers` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpentSecond` on the `quiz_attempt_answers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quiz_attempt_answers" DROP COLUMN "isCorrect",
DROP COLUMN "timeSpentSecond",
ADD COLUMN     "correctOptionIds" INTEGER[];
