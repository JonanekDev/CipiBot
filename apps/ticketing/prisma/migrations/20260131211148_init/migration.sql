-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "TicketCategories" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketCategoryQuestions" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TicketCategoryQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tickets" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketCategoryRoles" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "TicketCategoryRoles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketCategories_guildId_idx" ON "TicketCategories"("guildId");

-- CreateIndex
CREATE INDEX "TicketCategoryQuestions_categoryId_idx" ON "TicketCategoryQuestions"("categoryId");

-- CreateIndex
CREATE INDEX "Tickets_guildId_idx" ON "Tickets"("guildId");

-- CreateIndex
CREATE INDEX "Tickets_userId_idx" ON "Tickets"("userId");

-- CreateIndex
CREATE INDEX "Tickets_channelId_idx" ON "Tickets"("channelId");

-- CreateIndex
CREATE INDEX "TicketCategoryRoles_categoryId_idx" ON "TicketCategoryRoles"("categoryId");

-- AddForeignKey
ALTER TABLE "TicketCategoryQuestions" ADD CONSTRAINT "TicketCategoryQuestions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TicketCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TicketCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCategoryRoles" ADD CONSTRAINT "TicketCategoryRoles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TicketCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
