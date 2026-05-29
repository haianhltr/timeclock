-- Hand-written: preserves data. Prisma's autogen would DROP + ADD which
-- destroys the user-customised target. RENAME preserves it.

ALTER TABLE "Config" RENAME COLUMN "targetMin" TO "targetDesk";

ALTER TABLE "Config" ADD COLUMN "targetGate" INTEGER NOT NULL DEFAULT 480;

-- Belt-and-braces re-seed: the original add_config migration's seed INSERT
-- was removed (it triggered a hash mismatch). This INSERT is a no-op if the
-- singleton row already exists, but covers a fresh-clone bootstrap path.
INSERT INTO "Config" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
