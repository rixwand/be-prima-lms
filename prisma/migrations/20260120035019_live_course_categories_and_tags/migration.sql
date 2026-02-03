-- CreateTable
CREATE TABLE "public"."course_categories" (
    "courseId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("courseId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."course_tags" (
    "courseId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "course_tags_pkey" PRIMARY KEY ("courseId","tagId")
);

-- CreateIndex
CREATE INDEX "course_categories_categoryId_idx" ON "public"."course_categories"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."course_categories" ADD CONSTRAINT "course_categories_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_categories" ADD CONSTRAINT "course_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_tags" ADD CONSTRAINT "course_tags_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_tags" ADD CONSTRAINT "course_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
