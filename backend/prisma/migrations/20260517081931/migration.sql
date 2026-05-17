-- AlterTable
ALTER TABLE "core"."job_titles" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."payment_concepts" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."scholarships" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "core"."security_roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "security_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."security_role_permissions" (
    "id" UUID NOT NULL,
    "security_role_id" UUID NOT NULL,
    "module_key" VARCHAR(50) NOT NULL,
    "can_read" BOOLEAN NOT NULL,
    "can_write" BOOLEAN NOT NULL,
    "can_delete" BOOLEAN NOT NULL,

    CONSTRAINT "security_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "security_roles_name_key" ON "core"."security_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "security_role_permissions_security_role_id_module_key_key" ON "core"."security_role_permissions"("security_role_id", "module_key");

-- AddForeignKey
ALTER TABLE "core"."security_role_permissions" ADD CONSTRAINT "security_role_permissions_security_role_id_fkey" FOREIGN KEY ("security_role_id") REFERENCES "core"."security_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
