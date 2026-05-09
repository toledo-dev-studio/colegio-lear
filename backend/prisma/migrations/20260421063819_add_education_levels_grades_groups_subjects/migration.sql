-- CreateTable
CREATE TABLE "core"."education_levels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."grades" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "education_level_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "grade_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."subjects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."grade_subjects" (
    "id" SERIAL NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_levels_name_key" ON "core"."education_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grades_name_education_level_id_key" ON "core"."grades"("name", "education_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_grade_id_key" ON "core"."groups"("name", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_key" ON "core"."subjects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grade_subjects_grade_id_subject_id_key" ON "core"."grade_subjects"("grade_id", "subject_id");

-- AddForeignKey
ALTER TABLE "core"."grades" ADD CONSTRAINT "grades_education_level_id_fkey" FOREIGN KEY ("education_level_id") REFERENCES "core"."education_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."groups" ADD CONSTRAINT "groups_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "core"."grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."grade_subjects" ADD CONSTRAINT "grade_subjects_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "core"."grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."grade_subjects" ADD CONSTRAINT "grade_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "core"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
