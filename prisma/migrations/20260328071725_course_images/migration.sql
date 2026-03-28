/*
  Warnings:

  - A unique constraint covering the columns `[image_id]` on the table `courses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('PENDING_MODERATION', 'PUBLISHED', 'REJECTED');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "image_id" TEXT,
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'PENDING_MODERATION';

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_image_id_key" ON "courses"("image_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
