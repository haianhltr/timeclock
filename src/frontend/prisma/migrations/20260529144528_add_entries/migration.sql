-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('TIMED', 'NOTE');

-- CreateTable
CREATE TABLE "Entry" (
    "date" DATE NOT NULL,
    "type" "EntryType" NOT NULL,
    "gate" INTEGER,
    "desk" INTEGER,
    "reason" TEXT,
    "leftHome" INTEGER,
    "mood" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("date")
);
