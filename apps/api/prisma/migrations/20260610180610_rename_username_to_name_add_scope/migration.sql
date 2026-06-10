-- Rename username to name to match schema
ALTER TABLE "users" RENAME COLUMN "username" TO "name";

-- Add scopeType and scopeId columns
ALTER TABLE "users" ADD COLUMN "scopeType" TEXT;
ALTER TABLE "users" ADD COLUMN "scopeId" INTEGER;

-- Make nomorHp nullable
ALTER TABLE "users" ALTER COLUMN "nomorHp" DROP NOT NULL;

-- Add unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");