/*
  Warnings:

  - Added the required column `threadId` to the `forum_thread_replies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "forum_thread_replies" ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "threadId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "forum_thread_replies_threadId_idx" ON "forum_thread_replies"("threadId");

-- CreateIndex
CREATE INDEX "forum_thread_replies_parentId_idx" ON "forum_thread_replies"("parentId");

-- AddForeignKey
ALTER TABLE "forum_thread_replies" ADD CONSTRAINT "forum_thread_replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "forum_thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_thread_replies" ADD CONSTRAINT "forum_thread_replies_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "forum_thread_replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
