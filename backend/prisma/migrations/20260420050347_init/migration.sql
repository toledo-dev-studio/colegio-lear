-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "logs";

-- CreateTable
CREATE TABLE "core"."employees" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "employee_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."profiles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."privileges" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "module_reference_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privileges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."module_references" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs"."audit_logs" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "core"."employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_name_key" ON "core"."profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "privileges_profile_id_module_reference_id_action_key" ON "core"."privileges"("profile_id", "module_reference_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "module_references_name_key" ON "core"."module_references"("name");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "auth"."refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "core"."employees" ADD CONSTRAINT "employees_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "core"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."privileges" ADD CONSTRAINT "privileges_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "core"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."privileges" ADD CONSTRAINT "privileges_module_reference_id_fkey" FOREIGN KEY ("module_reference_id") REFERENCES "core"."module_references"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "core"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs"."audit_logs" ADD CONSTRAINT "audit_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "core"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
