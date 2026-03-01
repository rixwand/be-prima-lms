-- CreateIndex
CREATE INDEX "LessonProgress_enrollmentId_idx" ON "public"."LessonProgress"("enrollmentId");

-- CreateIndex
CREATE INDEX "LessonProgress_enrollmentId_status_idx" ON "public"."LessonProgress"("enrollmentId", "status");

-- CreateIndex
CREATE INDEX "enrollment_userId_idx" ON "public"."enrollment"("userId");
