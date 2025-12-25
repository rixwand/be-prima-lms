-- CreateEnum
CREATE TYPE "public"."PublishRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."course_publish_requests" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "status" "public"."PublishRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_publish_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_publish_requests_courseId_key" ON "public"."course_publish_requests"("courseId");

-- AddForeignKey
ALTER TABLE "public"."course_publish_requests" ADD CONSTRAINT "course_publish_requests_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_publish_requests" ADD CONSTRAINT "course_publish_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
