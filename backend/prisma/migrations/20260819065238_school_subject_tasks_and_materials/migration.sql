-- DropForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" DROP CONSTRAINT "academic_cycle_enrollments_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" DROP CONSTRAINT "academic_cycle_enrollments_academic_cycle_school_group_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" DROP CONSTRAINT "academic_cycle_enrollments_scholarship_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" DROP CONSTRAINT "academic_cycle_enrollments_student_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" DROP CONSTRAINT "academic_cycle_group_calendar_academic_cycle_school_group__fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" DROP CONSTRAINT "academic_cycle_group_calendars_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" DROP CONSTRAINT "academic_cycle_group_calendars_academic_cycle_school_subject_id";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" DROP CONSTRAINT "academic_cycle_group_calendars_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_groups" DROP CONSTRAINT "academic_cycle_groups_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_school_subjects" DROP CONSTRAINT "academic_cycle_school_subjects_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_school_subjects" DROP CONSTRAINT "academic_cycle_school_subjects_school_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycle_wallet" DROP CONSTRAINT "academic_cycle_wallet_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycles" DROP CONSTRAINT "academic_cycles_academic_level_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."academic_cycles" DROP CONSTRAINT "academic_cycles_education_level_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_allergies" DROP CONSTRAINT "student_allergies_student_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_grades" DROP CONSTRAINT "student_grades_academic_cycle_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_grades" DROP CONSTRAINT "student_grades_school_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_guardians" DROP CONSTRAINT "student_guardians_student_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_items" DROP CONSTRAINT "student_wallet_items_academic_cycle_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_items" DROP CONSTRAINT "student_wallet_items_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_items" DROP CONSTRAINT "student_wallet_items_academic_cycle_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_items" DROP CONSTRAINT "student_wallet_items_student_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_payments" DROP CONSTRAINT "student_wallet_payments_academic_cycle_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_payments" DROP CONSTRAINT "student_wallet_payments_academic_cycle_id_fkey";

-- DropForeignKey
ALTER TABLE "core"."student_wallet_payments" DROP CONSTRAINT "student_wallet_payments_student_wallet_item_id_fkey";

-- AlterTable
ALTER TABLE "core"."academic_cycle_enrollments" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "core"."academic_cycle_group_calendars" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."academic_cycle_groups" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "core"."academic_cycle_school_subjects" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."academic_cycle_wallet" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "due_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "core"."academic_cycles" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "start_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "end_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "core"."student_allergies" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."student_grades" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."student_guardians" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "core"."student_wallet_items" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "extension_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "due_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "core"."student_wallet_payments" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "core"."students" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "date_of_birth" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "password" DROP DEFAULT;

-- CreateTable
CREATE TABLE "core"."school_subject_tasks" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000),
    "due_date" TIMESTAMP(3) NOT NULL,
    "academic_cycle_id" UUID NOT NULL,
    "academic_cycle_school_group_id" UUID NOT NULL,
    "academic_cycle_school_subject_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_subject_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."school_subject_task_attachments" (
    "id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "school_subject_task_id" UUID NOT NULL,

    CONSTRAINT "school_subject_task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."school_subject_materials" (
    "id" UUID NOT NULL,
    "academic_cycle_id" UUID NOT NULL,
    "academic_cycle_school_group_id" UUID NOT NULL,
    "academic_cycle_school_subject_id" UUID NOT NULL,
    "attachment_url" VARCHAR(500) NOT NULL,
    "attachment_name" VARCHAR(300) NOT NULL,
    "attachment_extension" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_subject_materials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "core"."student_allergies" ADD CONSTRAINT "student_allergies_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "core"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "core"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycles" ADD CONSTRAINT "academic_cycles_academic_level_id_fkey" FOREIGN KEY ("academic_level_id") REFERENCES "core"."academic_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycles" ADD CONSTRAINT "academic_cycles_education_level_id_fkey" FOREIGN KEY ("education_level_id") REFERENCES "core"."education_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_school_subjects" ADD CONSTRAINT "academic_cycle_school_subjects_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_school_subjects" ADD CONSTRAINT "academic_cycle_school_subjects_school_subject_id_fkey" FOREIGN KEY ("school_subject_id") REFERENCES "core"."school_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_wallet" ADD CONSTRAINT "academic_cycle_wallet_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_groups" ADD CONSTRAINT "academic_cycle_groups_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" ADD CONSTRAINT "academic_cycle_group_calendars_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" ADD CONSTRAINT "academic_cycle_group_calendars_academic_cycle_school_group_fkey" FOREIGN KEY ("academic_cycle_school_group_id") REFERENCES "core"."academic_cycle_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" ADD CONSTRAINT "academic_cycle_group_calendars_academic_cycle_school_subje_fkey" FOREIGN KEY ("academic_cycle_school_subject_id") REFERENCES "core"."academic_cycle_school_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_group_calendars" ADD CONSTRAINT "academic_cycle_group_calendars_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "core"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" ADD CONSTRAINT "academic_cycle_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "core"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" ADD CONSTRAINT "academic_cycle_enrollments_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" ADD CONSTRAINT "academic_cycle_enrollments_academic_cycle_school_group_id_fkey" FOREIGN KEY ("academic_cycle_school_group_id") REFERENCES "core"."academic_cycle_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."academic_cycle_enrollments" ADD CONSTRAINT "academic_cycle_enrollments_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "core"."scholarships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_grades" ADD CONSTRAINT "student_grades_school_subject_id_fkey" FOREIGN KEY ("school_subject_id") REFERENCES "core"."school_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_grades" ADD CONSTRAINT "student_grades_academic_cycle_enrollment_id_fkey" FOREIGN KEY ("academic_cycle_enrollment_id") REFERENCES "core"."academic_cycle_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_wallet_items" ADD CONSTRAINT "student_wallet_items_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "core"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_wallet_items" ADD CONSTRAINT "student_wallet_items_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_wallet_items" ADD CONSTRAINT "student_wallet_items_academic_cycle_wallet_id_fkey" FOREIGN KEY ("academic_cycle_wallet_id") REFERENCES "core"."academic_cycle_wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_wallet_payments" ADD CONSTRAINT "student_wallet_payments_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_wallet_payments" ADD CONSTRAINT "student_wallet_payments_academic_cycle_enrollment_id_fkey" FOREIGN KEY ("academic_cycle_enrollment_id") REFERENCES "core"."academic_cycle_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_wallet_payments" ADD CONSTRAINT "student_wallet_payments_student_wallet_item_id_fkey" FOREIGN KEY ("student_wallet_item_id") REFERENCES "core"."student_wallet_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_tasks" ADD CONSTRAINT "school_subject_tasks_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_tasks" ADD CONSTRAINT "school_subject_tasks_academic_cycle_school_group_id_fkey" FOREIGN KEY ("academic_cycle_school_group_id") REFERENCES "core"."academic_cycle_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_tasks" ADD CONSTRAINT "school_subject_tasks_academic_cycle_school_subject_id_fkey" FOREIGN KEY ("academic_cycle_school_subject_id") REFERENCES "core"."academic_cycle_school_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_task_attachments" ADD CONSTRAINT "school_subject_task_attachments_school_subject_task_id_fkey" FOREIGN KEY ("school_subject_task_id") REFERENCES "core"."school_subject_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_materials" ADD CONSTRAINT "school_subject_materials_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "core"."academic_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_materials" ADD CONSTRAINT "school_subject_materials_academic_cycle_school_group_id_fkey" FOREIGN KEY ("academic_cycle_school_group_id") REFERENCES "core"."academic_cycle_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."school_subject_materials" ADD CONSTRAINT "school_subject_materials_academic_cycle_school_subject_id_fkey" FOREIGN KEY ("academic_cycle_school_subject_id") REFERENCES "core"."academic_cycle_school_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "core"."academic_cycle_school_subject_academic_cycle_id_school_subj_key" RENAME TO "academic_cycle_school_subjects_academic_cycle_id_school_sub_key";
