-- Public MMO foundation: accounts, sessions, locations, banks, and quest progress.

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_accountId_idx" ON "Session"("accountId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

ALTER TABLE "Session"
ADD CONSTRAINT "Session_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Character"
ADD COLUMN "accountId" TEXT,
ADD COLUMN "worldId" TEXT NOT NULL DEFAULT 'world-1',
ADD COLUMN "regionId" TEXT NOT NULL DEFAULT 'market_cross',
ADD COLUMN "tileX" INTEGER NOT NULL DEFAULT 32,
ADD COLUMN "tileY" INTEGER NOT NULL DEFAULT 32,
ADD COLUMN "hp" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "maxHp" INTEGER NOT NULL DEFAULT 10;

INSERT INTO "Account" ("id", "email", "passwordHash", "createdAt", "updatedAt")
VALUES ('dev-account-01', 'dev@prooflayer.local', 'legacy-dev-login-disabled', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE "Character"
SET "accountId" = 'dev-account-01'
WHERE "accountId" IS NULL;

CREATE INDEX "Character_accountId_idx" ON "Character"("accountId");
CREATE INDEX "Character_worldId_regionId_idx" ON "Character"("worldId", "regionId");

ALTER TABLE "Character"
ADD CONSTRAINT "Character_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "BankStack" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "BankStack_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BankStack_characterId_itemId_key" ON "BankStack"("characterId", "itemId");

ALTER TABLE "BankStack"
ADD CONSTRAINT "BankStack_characterId_fkey"
FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "QuestProgress" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuestProgress_characterId_questId_key" ON "QuestProgress"("characterId", "questId");

ALTER TABLE "QuestProgress"
ADD CONSTRAINT "QuestProgress_characterId_fkey"
FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
