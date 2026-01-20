-- AlterTable
ALTER TABLE "public"."courses" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."lesson_blocks" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "profile_picture" DROP NOT NULL,
ALTER COLUMN "profile_picture" DROP DEFAULT;
