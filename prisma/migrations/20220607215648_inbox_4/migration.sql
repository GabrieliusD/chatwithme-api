/*
  Warnings:

  - You are about to drop the `Inbox_Participants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Inbox_Participants" DROP CONSTRAINT "Inbox_Participants_inboxId_fkey";

-- DropForeignKey
ALTER TABLE "Inbox_Participants" DROP CONSTRAINT "Inbox_Participants_userId_fkey";

-- DropTable
DROP TABLE "Inbox_Participants";
