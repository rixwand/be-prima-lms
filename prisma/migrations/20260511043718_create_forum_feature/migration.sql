/*
  Warnings:

  - You are about to drop the `SectionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SectionItem" DROP CONSTRAINT "SectionItem_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_sectionItemId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_sectionItemId_fkey";

-- DropTable
DROP TABLE "SectionItem";

-- CreateTable
CREATE TABLE "section_items" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "type" "SectionItemType" NOT NULL,
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum" (
    "id" SERIAL NOT NULL,
    "sectionItemId" INTEGER NOT NULL,

    CONSTRAINT "forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_thread" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "forumId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "forum_thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_thread_replies" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "forum_thread_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "section_items_slug_key" ON "section_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "forum_sectionItemId_key" ON "forum"("sectionItemId");

-- AddForeignKey
ALTER TABLE "section_items" ADD CONSTRAINT "section_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "course_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "section_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum" ADD CONSTRAINT "forum_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "section_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_thread" ADD CONSTRAINT "forum_thread_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "forum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_thread" ADD CONSTRAINT "forum_thread_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_thread_replies" ADD CONSTRAINT "forum_thread_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_sectionItemId_fkey" FOREIGN KEY ("sectionItemId") REFERENCES "section_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
