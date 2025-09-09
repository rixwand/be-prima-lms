-- DropForeignKey
ALTER TABLE "public"."refresh_session" DROP CONSTRAINT "refresh_session_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."refresh_session" ADD CONSTRAINT "refresh_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
