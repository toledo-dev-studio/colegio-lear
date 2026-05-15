-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

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

-- CreateIndex
CREATE UNIQUE INDEX "academic_levels_name_key" ON "core"."academic_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "education_levels_name_academic_level_id_key" ON "core"."education_levels"("name", "academic_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_subjects_name_education_level_id_key" ON "core"."school_subjects"("name", "education_level_id");

-- AddForeignKey
ALTER TABLE "core"."education_levels" ADD CONSTRAINT "education_levels_academic_level_id_fkey" FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subjects" ADD CONSTRAINT "school_subjects_academic_level_id_fkey" FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subjects" ADD CONSTRAINT "school_subjects_education_level_id_fkey" FOREIGN KEY ("education_level_id") REFERENCES "core"."education_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateView
CREATE OR REPLACE VIEW core.v_school_subjects AS
SELECT
  ss.id,
  ss.name,
  ss.description,
  ss.status,
  ss.academic_level_id,
  al.name AS academic_level_name,
  ss.education_level_id,
  el.name AS education_level_name
FROM core.school_subjects ss
JOIN core.academic_levels al ON al.id = ss.academic_level_id
JOIN core.education_levels el ON el.id = ss.education_level_id;
