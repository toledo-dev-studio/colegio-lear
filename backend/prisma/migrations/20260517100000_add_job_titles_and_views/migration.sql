-- CreateView: v_academic_levels
CREATE OR REPLACE VIEW core.v_academic_levels AS
SELECT
  al.id,
  al.name,
  al.description,
  al.status
FROM core.academic_levels al;

-- CreateEnum
CREATE TYPE core."JobTitleType" AS ENUM ('teacher', 'administrative-staff');

-- CreateTable
CREATE TABLE core.job_titles (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "job_title_type" core."JobTitleType" NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_titles_name_key" ON core.job_titles("name");
