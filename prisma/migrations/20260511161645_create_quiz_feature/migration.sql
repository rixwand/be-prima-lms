/*
  Warnings:

  - Added the required column `updatedAt` to the `forum_thread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `forum_thread_replies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "forum_thread" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "forum_thread_replies" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "quiz" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "sectionItemId" INTEGER NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_sectionItemId_key" ON "quiz"("sectionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_quizId_position_key" ON "quiz_questions"("quizId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_options_questionId_position_key" ON "quiz_options"("questionId", "position");

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "section_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
