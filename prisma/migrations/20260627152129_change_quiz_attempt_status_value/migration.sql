/*
  Warnings:

  - The values [CANCELED,FINISHED] on the enum `QuizAttemptStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuizAttemptStatus_new" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED');
ALTER TABLE "quiz_attempts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "quiz_attempts" ALTER COLUMN "status" TYPE "QuizAttemptStatus_new" USING ("status"::text::"QuizAttemptStatus_new");
ALTER TYPE "QuizAttemptStatus" RENAME TO "QuizAttemptStatus_old";
ALTER TYPE "QuizAttemptStatus_new" RENAME TO "QuizAttemptStatus";
DROP TYPE "QuizAttemptStatus_old";
ALTER TABLE "quiz_attempts" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;
