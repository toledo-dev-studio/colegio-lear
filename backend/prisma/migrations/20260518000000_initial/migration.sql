-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- ═══════════════════════════════════════════════════════════════════════════════
-- BASE TABLES (no FK dependencies)
-- ═══════════════════════════════════════════════════════════════════════════════

-- CreateTable: academic_levels
CREATE TABLE "core"."academic_levels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "academic_levels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_levels_name_key" ON "core"."academic_levels"("name");

-- CreateTable: scholarships
CREATE TABLE "core"."scholarships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scholarships_name_key" ON "core"."scholarships"("name");

-- CreateTable: payment_concepts
CREATE TABLE "core"."payment_concepts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payment_concepts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_concepts_name_key" ON "core"."payment_concepts"("name");

-- CreateEnum: JobTitleType
CREATE TYPE "core"."JobTitleType" AS ENUM ('teacher', 'administrative-staff');

-- CreateTable: job_titles
CREATE TABLE "core"."job_titles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "job_title_type" "core"."JobTitleType" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_titles_name_key" ON "core"."job_titles"("name");

-- CreateTable: security_roles
CREATE TABLE "core"."security_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "security_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "security_roles_name_key" ON "core"."security_roles"("name");

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLES WITH FK TO BASE TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- CreateTable: education_levels (FK → academic_levels)
CREATE TABLE "core"."education_levels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "academic_level_id" UUID NOT NULL,

    CONSTRAINT "education_levels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "education_levels_name_academic_level_id_key" ON "core"."education_levels"("name", "academic_level_id");

ALTER TABLE "core"."education_levels"
    ADD CONSTRAINT "education_levels_academic_level_id_fkey"
    FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: security_role_permissions (FK → security_roles)
CREATE TABLE "core"."security_role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "security_role_id" UUID NOT NULL,
    "module_key" VARCHAR(50) NOT NULL,
    "can_read" BOOLEAN NOT NULL,
    "can_write" BOOLEAN NOT NULL,
    "can_delete" BOOLEAN NOT NULL,

    CONSTRAINT "security_role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "security_role_permissions_security_role_id_module_key_key"
    ON "core"."security_role_permissions"("security_role_id", "module_key");

ALTER TABLE "core"."security_role_permissions"
    ADD CONSTRAINT "security_role_permissions_security_role_id_fkey"
    FOREIGN KEY ("security_role_id") REFERENCES "core"."security_roles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: school_subjects (FK → academic_levels, education_levels)
CREATE TABLE "core"."school_subjects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "academic_level_id" UUID NOT NULL,
    "education_level_id" UUID NOT NULL,

    CONSTRAINT "school_subjects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "school_subjects_name_education_level_id_key" ON "core"."school_subjects"("name", "education_level_id");

ALTER TABLE "core"."school_subjects"
    ADD CONSTRAINT "school_subjects_academic_level_id_fkey"
    FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "core"."school_subjects"
    ADD CONSTRAINT "school_subjects_education_level_id_fkey"
    FOREIGN KEY ("education_level_id") REFERENCES "core"."education_levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: employees (FK → job_titles, security_roles)
CREATE TABLE "core"."employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "first_last_name" VARCHAR(100) NOT NULL,
    "second_last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "image" VARCHAR(500),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "security_role_id" UUID NOT NULL,
    "job_title_id" UUID NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "employees_email_key" ON "core"."employees"("email");
CREATE UNIQUE INDEX "employees_username_key" ON "core"."employees"("username");

ALTER TABLE "core"."employees"
    ADD CONSTRAINT "employees_security_role_id_fkey"
    FOREIGN KEY ("security_role_id") REFERENCES "core"."security_roles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "core"."employees"
    ADD CONSTRAINT "employees_job_title_id_fkey"
    FOREIGN KEY ("job_title_id") REFERENCES "core"."job_titles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VIEWS (all tables must exist before creating views)
-- ═══════════════════════════════════════════════════════════════════════════════

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
