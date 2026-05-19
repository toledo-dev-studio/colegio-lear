-- CreateTable
CREATE TABLE "core"."announcements" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "audience" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."attachments" (
    "id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "related_record_id" UUID NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "core"."attachments" ADD CONSTRAINT "attachments_related_record_id_fkey" FOREIGN KEY ("related_record_id") REFERENCES "core"."announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
