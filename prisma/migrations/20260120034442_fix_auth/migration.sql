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

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_session_replaced_by_jti_key" ON "public"."refresh_session"("replaced_by_jti");

-- CreateIndex
CREATE INDEX "refresh_session_userId_revokedAt_expiresAt_idx" ON "public"."refresh_session"("userId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX "refresh_session_expiresAt_idx" ON "public"."refresh_session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "activation_tokens_selector_key" ON "public"."activation_tokens"("selector");

-- CreateIndex
CREATE INDEX "activation_tokens_userId_expiresAt_idx" ON "public"."activation_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "activation_tokens_userId_usedAt_idx" ON "public"."activation_tokens"("userId", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_scope_action_resource_key" ON "public"."permissions"("scope", "action", "resource");

-- AddForeignKey
ALTER TABLE "public"."refresh_session" ADD CONSTRAINT "refresh_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_session" ADD CONSTRAINT "refresh_session_replaced_by_jti_fkey" FOREIGN KEY ("replaced_by_jti") REFERENCES "public"."refresh_session"("jti") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activation_tokens" ADD CONSTRAINT "activation_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
