/*
  Warnings:

  - You are about to drop the column `type` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('TICKET', 'DIRECT', 'GROUP');

-- AlterEnum
ALTER TYPE "MemberRole" ADD VALUE 'SUPPORTER';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'TICKET';

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "type";

-- DropEnum
DROP TYPE "MessageType";
