-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "targetMin" INTEGER NOT NULL DEFAULT 485,
    "boss" TEXT NOT NULL DEFAULT 'Scott',
    "accentHex" TEXT NOT NULL DEFAULT '#e8744e',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton row so app code can assume id=1 always exists.
-- Idempotent: ON CONFLICT no-ops if the row is already present.
INSERT INTO "Config" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
