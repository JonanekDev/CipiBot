-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordAccessToken" TEXT NOT NULL,
    "discordRefreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
