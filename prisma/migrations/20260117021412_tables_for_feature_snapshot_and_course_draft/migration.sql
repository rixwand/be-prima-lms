-- CreateTable
CREATE TABLE "public"."course_snapshots" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_meta_drafts" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "priceAmount" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_meta_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_draft_tags" (
    "draftId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "course_draft_tags_pkey" PRIMARY KEY ("draftId","tagId")
);

-- CreateTable
CREATE TABLE "public"."course_draft_categories" (
    "draftId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,

    CONSTRAINT "course_draft_categories_pkey" PRIMARY KEY ("draftId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."course_draft_discounts" (
    "id" SERIAL NOT NULL,
    "draftId" INTEGER NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_draft_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_snapshots_courseId_idx" ON "public"."course_snapshots"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_meta_drafts_courseId_key" ON "public"."course_meta_drafts"("courseId");

-- CreateIndex
CREATE INDEX "course_draft_categories_categoryId_idx" ON "public"."course_draft_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "course_draft_discounts_draftId_key" ON "public"."course_draft_discounts"("draftId");

-- CreateIndex
CREATE INDEX "course_draft_discounts_draftId_isActive_idx" ON "public"."course_draft_discounts"("draftId", "isActive");

-- CreateIndex
CREATE INDEX "course_draft_discounts_draftId_startAt_endAt_idx" ON "public"."course_draft_discounts"("draftId", "startAt", "endAt");

-- AddForeignKey
ALTER TABLE "public"."course_snapshots" ADD CONSTRAINT "course_snapshots_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_meta_drafts" ADD CONSTRAINT "course_meta_drafts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_draft_tags" ADD CONSTRAINT "course_draft_tags_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."course_meta_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_draft_tags" ADD CONSTRAINT "course_draft_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_draft_categories" ADD CONSTRAINT "course_draft_categories_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."course_meta_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_draft_categories" ADD CONSTRAINT "course_draft_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_draft_discounts" ADD CONSTRAINT "course_draft_discounts_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."course_meta_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
