/*
  Warnings:

  - Added the required column `fileName` to the `Community` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "fileName" TEXT NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;
