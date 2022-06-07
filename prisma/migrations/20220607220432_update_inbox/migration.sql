-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_userId_fkey";

-- AlterTable
ALTER TABLE "Inbox" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Inbox_Participants" (
    "id" INTEGER NOT NULL,
    "userId" TEXT,
    "inboxId" INTEGER,

    CONSTRAINT "Inbox_Participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inbox_Participants_id_key" ON "Inbox_Participants"("id");

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_Participants" ADD CONSTRAINT "Inbox_Participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_Participants" ADD CONSTRAINT "Inbox_Participants_inboxId_fkey" FOREIGN KEY ("inboxId") REFERENCES "Inbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
