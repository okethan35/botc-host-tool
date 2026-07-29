-- CreateEnum
CREATE TYPE "GamePhase" AS ENUM ('lobby', 'night', 'day');

-- CreateEnum
CREATE TYPE "Team" AS ENUM ('townsfolk', 'outsider', 'minion', 'demon');

-- CreateEnum
CREATE TYPE "Alignment" AS ENUM ('good', 'evil');

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostToken" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "phase" "GamePhase" NOT NULL DEFAULT 'lobby',
    "nightNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "hasDevice" BOOLEAN NOT NULL DEFAULT true,
    "socketId" TEXT,
    "sessionToken" TEXT NOT NULL,
    "seatPosition" INTEGER NOT NULL,
    "roleId" TEXT,
    "alignment" "Alignment",
    "alive" BOOLEAN NOT NULL DEFAULT true,
    "hostNotes" TEXT NOT NULL DEFAULT '',
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team" "Team" NOT NULL,
    "abilityText" TEXT NOT NULL,
    "faqText" TEXT NOT NULL,
    "firstNightOrder" INTEGER,
    "otherNightOrder" INTEGER,
    "reminderText" TEXT NOT NULL,
    "setupEffect" JSONB,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NightOrderProgress" (
    "gameId" TEXT NOT NULL,
    "nightNumber" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_code_key" ON "Game"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Game_hostToken_key" ON "Game"("hostToken");

-- CreateIndex
CREATE UNIQUE INDEX "Player_sessionToken_key" ON "Player"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Role_scriptId_name_key" ON "Role"("scriptId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "NightOrderProgress_gameId_nightNumber_roleId_key" ON "NightOrderProgress"("gameId", "nightNumber", "roleId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightOrderProgress" ADD CONSTRAINT "NightOrderProgress_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightOrderProgress" ADD CONSTRAINT "NightOrderProgress_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
