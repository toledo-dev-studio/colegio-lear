-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateEnum
CREATE TYPE "core"."JobTitleType" AS ENUM ('teacher', 'administrative-staff');

-- CreateTable
CREATE TABLE "core"."academic_levels" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "academic_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."education_levels" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "academic_level_id" UUID NOT NULL,

    CONSTRAINT "education_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."school_subjects" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "academic_level_id" UUID NOT NULL,
    "education_level_id" UUID NOT NULL,

    CONSTRAINT "school_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."scholarships" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."payment_concepts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "base_amount" DECIMAL(10,2) NOT NULL,
    "allow_remission" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payment_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."job_titles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "job_title_type" "core"."JobTitleType" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "core"."employees" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "first_last_name" VARCHAR(100) NOT NULL,
    "second_last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "image" VARCHAR(500),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "security_role_id" UUID NOT NULL,
    "job_title_id" UUID NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_levels_name_key" ON "core"."academic_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "education_levels_name_academic_level_id_key" ON "core"."education_levels"("name", "academic_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_subjects_name_education_level_id_key" ON "core"."school_subjects"("name", "education_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_name_key" ON "core"."scholarships"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_concepts_name_key" ON "core"."payment_concepts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_titles_name_key" ON "core"."job_titles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "security_roles_name_key" ON "core"."security_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "security_role_permissions_security_role_id_module_key_key" ON "core"."security_role_permissions"("security_role_id", "module_key");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "core"."employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_username_key" ON "core"."employees"("username");

-- AddForeignKey
ALTER TABLE "core"."education_levels" ADD CONSTRAINT "education_levels_academic_level_id_fkey" FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subjects" ADD CONSTRAINT "school_subjects_academic_level_id_fkey" FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subjects" ADD CONSTRAINT "school_subjects_education_level_id_fkey" FOREIGN KEY ("education_level_id") REFERENCES "core"."education_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."security_role_permissions" ADD CONSTRAINT "security_role_permissions_security_role_id_fkey" FOREIGN KEY ("security_role_id") REFERENCES "core"."security_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."employees" ADD CONSTRAINT "employees_security_role_id_fkey" FOREIGN KEY ("security_role_id") REFERENCES "core"."security_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."employees" ADD CONSTRAINT "employees_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "core"."job_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateView: v_school_subjects
CREATE OR REPLACE VIEW "core"."v_school_subjects" AS
SELECT
    ss.id,
    ss.name,
    ss.description,
    ss.status,
    ss.academic_level_id,
    al.name AS academic_level_name,
    ss.education_level_id,
    el.name AS education_level_name
FROM "core"."school_subjects" ss
JOIN "core"."academic_levels" al ON al.id = ss.academic_level_id
JOIN "core"."education_levels" el ON el.id = ss.education_level_id;

-- CreateView: v_academic_levels
CREATE OR REPLACE VIEW "core"."v_academic_levels" AS
SELECT
    al.id,
    al.name,
    al.description,
    al.status
FROM "core"."academic_levels" al;
