/*
  Warnings:

  - You are about to drop the column `token` on the `tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashedRt]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedRt` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tokens_token_key";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "token",
ADD COLUMN     "hashedRt" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_hashedRt_key" ON "tokens"("hashedRt");
