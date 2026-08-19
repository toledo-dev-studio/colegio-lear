-- CreateEnum
CREATE TYPE "core"."ChatMessageSender" AS ENUM ('student', 'teacher');

-- CreateTable
CREATE TABLE "core"."student_chat_messages" (
    "id" UUID NOT NULL,
    "academic_cycle_enrollment_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "sent_by" "core"."ChatMessageSender" NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "student_chat_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "core"."student_chat_messages" ADD CONSTRAINT "student_chat_messages_academic_cycle_enrollment_id_fkey" FOREIGN KEY ("academic_cycle_enrollment_id") REFERENCES "core"."academic_cycle_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core"."student_chat_messages" ADD CONSTRAINT "student_chat_messages_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "core"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
