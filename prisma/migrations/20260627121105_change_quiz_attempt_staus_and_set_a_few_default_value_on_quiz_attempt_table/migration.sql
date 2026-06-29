/*
  Warnings:

  - The values [PASSED,FAILED] on the enum `QuizAttemptStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuizAttemptStatus_new" AS ENUM ('IN_PROGRESS', 'CANCELED', 'FINISHED');
ALTER TABLE "quiz_attempts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "quiz_attempts" ALTER COLUMN "status" TYPE "QuizAttemptStatus_new" USING ("status"::text::"QuizAttemptStatus_new");
ALTER TYPE "QuizAttemptStatus" RENAME TO "QuizAttemptStatus_old";
ALTER TYPE "QuizAttemptStatus_new" RENAME TO "QuizAttemptStatus";
DROP TYPE "QuizAttemptStatus_old";
ALTER TABLE "quiz_attempts" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "quiz_attempts" ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "percentage" SET DEFAULT 0,
ALTER COLUMN "passed" SET DEFAULT false,
ALTER COLUMN "timeSpentSecond" SET DEFAULT 0;
