/*
  Warnings:

  - Made the column `userId` on table `Inbox_Participants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inboxId` on table `Inbox_Participants` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Inbox_Participants" DROP CONSTRAINT "Inbox_Participants_inboxId_fkey";

-- DropForeignKey
ALTER TABLE "Inbox_Participants" DROP CONSTRAINT "Inbox_Participants_userId_fkey";

-- AlterTable
ALTER TABLE "Inbox_Participants" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "inboxId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Inbox_Participants" ADD CONSTRAINT "Inbox_Participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_Participants" ADD CONSTRAINT "Inbox_Participants_inboxId_fkey" FOREIGN KEY ("inboxId") REFERENCES "Inbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
