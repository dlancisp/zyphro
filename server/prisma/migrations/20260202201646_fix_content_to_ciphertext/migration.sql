/*
  Warnings:

  - You are about to drop the column `content` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Secret` table. All the data in the column will be lost.
  - Added the required column `cipherText` to the `Secret` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Secret" DROP COLUMN "content",
DROP COLUMN "expiresAt",
ADD COLUMN     "cipherText" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Switch" ADD COLUMN     "userId" TEXT;
