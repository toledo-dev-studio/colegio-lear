-- CreateEnum
CREATE TYPE "core"."AssistStatus" AS ENUM ('present', 'absent');

-- CreateTable
CREATE TABLE "core"."student_assists" (
    "id" UUID NOT NULL,
    "academic_cycle_enrollment_id" UUID NOT NULL,
    "assist_date" TIMESTAMP(3) NOT NULL,
    "status" "core"."AssistStatus" NOT NULL DEFAULT 'present',
    "absence_reason" VARCHAR(1000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_assists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_assists_academic_cycle_enrollment_id_assist_date_key" ON "core"."student_assists"("academic_cycle_enrollment_id", "assist_date");

-- AddForeignKey
ALTER TABLE "core"."student_assists" ADD CONSTRAINT "student_assists_academic_cycle_enrollment_id_fkey" FOREIGN KEY ("academic_cycle_enrollment_id") REFERENCES "core"."academic_cycle_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
