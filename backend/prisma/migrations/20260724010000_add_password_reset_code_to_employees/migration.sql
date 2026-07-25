-- Add columns to support the session-based password reset flow:
-- a hashed 6-digit confirmation code + its expiration timestamp.
ALTER TABLE core.employees ADD COLUMN "password_reset_code" VARCHAR(255);
ALTER TABLE core.employees ADD COLUMN "password_reset_code_expires_at" TIMESTAMP(3);
