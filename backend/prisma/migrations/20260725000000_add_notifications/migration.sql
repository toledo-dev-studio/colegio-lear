-- CreateEnum
CREATE TYPE "core"."NotificationType" AS ENUM ('info', 'error', 'announcement', 'message');

-- CreateTable
CREATE TABLE "core"."notifications" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "type" "core"."NotificationType" NOT NULL,
    "related_record_id" UUID NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_employee_id_created_at_idx" ON "core"."notifications"("employee_id", "created_at");

-- AddForeignKey
ALTER TABLE "core"."notifications" ADD CONSTRAINT "notifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "core"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
