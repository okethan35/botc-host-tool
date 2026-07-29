-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "believedRoleId" TEXT;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_believedRoleId_fkey" FOREIGN KEY ("believedRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
