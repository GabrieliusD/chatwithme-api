-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hobbies" TEXT[],
ADD COLUMN     "userWorkId" INTEGER;

-- CreateTable
CREATE TABLE "UserWork" (
    "id" SERIAL NOT NULL,
    "jobTitle" TEXT,
    "address" TEXT,
    "telNumber" INTEGER,

    CONSTRAINT "UserWork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userWorkId_fkey" FOREIGN KEY ("userWorkId") REFERENCES "UserWork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
