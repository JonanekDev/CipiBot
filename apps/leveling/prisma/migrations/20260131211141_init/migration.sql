-- CreateTable
CREATE TABLE "UserLevel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "left" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLevel_guildId_idx" ON "UserLevel"("guildId");

-- CreateIndex
CREATE INDEX "UserLevel_guildId_xp_idx" ON "UserLevel"("guildId", "xp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "UserLevel_guildId_userId_key" ON "UserLevel"("guildId", "userId");
