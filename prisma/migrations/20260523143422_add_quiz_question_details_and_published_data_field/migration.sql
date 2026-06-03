-- AlterTable
ALTER TABLE "quiz" ADD COLUMN     "publishedData" JSONB;

-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN     "estimatedTimesSecond" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "multipleAnswer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1;
