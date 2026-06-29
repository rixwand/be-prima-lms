/*
  Warnings:

  - You are about to drop the column `questionId` on the `quiz_attempt_answers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attemptId,snapshotQuestionId]` on the table `quiz_attempt_answers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `snapshotQuestionId` to the `quiz_attempt_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotId` to the `quiz_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS', 'CANCELED', 'PASSED', 'FAILED');

-- DropForeignKey
ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "quiz_attempt_answers_questionId_fkey";

-- DropIndex
DROP INDEX "quiz_attempt_answers_attemptId_questionId_key";

-- AlterTable
ALTER TABLE "quiz" ADD COLUMN     "publishedVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quiz_attempt_answers" DROP COLUMN "questionId",
ADD COLUMN     "snapshotQuestionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "snapshotId" INTEGER NOT NULL,
ADD COLUMN     "status" "QuizAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "submittedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "quiz_snapshots" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "publishedVersion" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_snapshots_quizId_idx" ON "quiz_snapshots"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_snapshots_quizId_publishedVersion_key" ON "quiz_snapshots"("quizId", "publishedVersion");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempt_answers_attemptId_snapshotQuestionId_key" ON "quiz_attempt_answers"("attemptId", "snapshotQuestionId");

-- CreateIndex
CREATE INDEX "quiz_attempts_snapshotId_idx" ON "quiz_attempts"("snapshotId");

-- AddForeignKey
ALTER TABLE "quiz_snapshots" ADD CONSTRAINT "quiz_snapshots_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "quiz_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
