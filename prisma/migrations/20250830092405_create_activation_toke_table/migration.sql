-- CreateTable
CREATE TABLE "public"."activation_tokens" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "selector" VARCHAR(64) NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "activation_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activation_tokens_selector_key" ON "public"."activation_tokens"("selector");

-- CreateIndex
CREATE INDEX "activation_tokens_userId_expiresAt_idx" ON "public"."activation_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "activation_tokens_userId_usedAt_idx" ON "public"."activation_tokens"("userId", "usedAt");

-- AddForeignKey
ALTER TABLE "public"."activation_tokens" ADD CONSTRAINT "activation_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
