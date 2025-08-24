-- CreateTable
CREATE TABLE "public"."refresh_session" (
    "jti" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replaced_by_jti" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_session_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_session_replaced_by_jti_key" ON "public"."refresh_session"("replaced_by_jti");

-- CreateIndex
CREATE INDEX "refresh_session_userId_revokedAt_expiresAt_idx" ON "public"."refresh_session"("userId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "refresh_session_expiresAt_idx" ON "public"."refresh_session"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."refresh_session" ADD CONSTRAINT "refresh_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_session" ADD CONSTRAINT "refresh_session_replaced_by_jti_fkey" FOREIGN KEY ("replaced_by_jti") REFERENCES "public"."refresh_session"("jti") ON DELETE SET NULL ON UPDATE CASCADE;
