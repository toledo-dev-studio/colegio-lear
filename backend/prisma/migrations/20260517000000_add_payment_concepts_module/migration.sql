-- CreateTable
CREATE TABLE "core"."payment_concepts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "base_amount" DECIMAL(10,2) NOT NULL,
    "allow_remission" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payment_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_concepts_name_key" ON "core"."payment_concepts"("name");
