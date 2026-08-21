-- AlterTable
ALTER TABLE "core"."notifications" ADD COLUMN     "student_id" UUID,
ALTER COLUMN "employee_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_student_id_created_at_idx" ON "core"."notifications"("student_id", "created_at");

-- AddForeignKey
ALTER TABLE "core"."notifications" ADD CONSTRAINT "notifications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "core"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
