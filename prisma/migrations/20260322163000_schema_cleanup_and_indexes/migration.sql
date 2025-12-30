-- Make auth defaults explicit and add lookup indexes used by auth/session flows.
ALTER TABLE "public"."user"
ALTER COLUMN "emailVerified" SET DEFAULT false;

CREATE INDEX IF NOT EXISTS "session_userId_idx"
ON "public"."session"("userId");

CREATE INDEX IF NOT EXISTS "account_userId_idx"
ON "public"."account"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "account_providerId_accountId_key"
ON "public"."account"("providerId", "accountId");

CREATE INDEX IF NOT EXISTS "verification_identifier_idx"
ON "public"."verification"("identifier");

CREATE INDEX IF NOT EXISTS "verification_expiresAt_idx"
ON "public"."verification"("expiresAt");
