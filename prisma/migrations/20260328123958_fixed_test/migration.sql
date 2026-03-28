/*
  Warnings:

  - You are about to drop the column `userId` on the `question_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `test_attempts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lesson_id]` on the table `steps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[test_id]` on the table `steps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `testAttemptId` to the `question_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passed` to the `test_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `test_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `test_id` to the `test_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `test_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "question_attempts" DROP CONSTRAINT "question_attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "test_attempts" DROP CONSTRAINT "test_attempts_testId_fkey";

-- AlterTable
ALTER TABLE "question_attempts" DROP COLUMN "userId",
ADD COLUMN     "testAttemptId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "test_attempts" DROP COLUMN "testId",
ADD COLUMN     "passed" BOOLEAN NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "test_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "passing_score" INTEGER NOT NULL DEFAULT 80;

-- CreateIndex
CREATE UNIQUE INDEX "steps_lesson_id_key" ON "steps"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "steps_test_id_key" ON "steps"("test_id");

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_testAttemptId_fkey" FOREIGN KEY ("testAttemptId") REFERENCES "test_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
