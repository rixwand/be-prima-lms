-- AlterTable
ALTER TABLE "forum_thread_replies" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" INTEGER;

-- AddForeignKey
ALTER TABLE "forum_thread_replies" ADD CONSTRAINT "forum_thread_replies_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
