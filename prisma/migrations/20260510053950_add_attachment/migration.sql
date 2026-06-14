/*
  Warnings:

  - You are about to drop the column `mimeType` on the `MessageAttachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MessageAttachment" DROP COLUMN "mimeType",
ADD COLUMN     "fileType" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "MemberRole" NOT NULL DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);
