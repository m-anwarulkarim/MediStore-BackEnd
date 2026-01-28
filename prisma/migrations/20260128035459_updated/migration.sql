/*
  Warnings:

  - A unique constraint covering the columns `[slug,userId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,sellerId]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Category_slug_idx";

-- DropIndex
DROP INDEX "Medicine_slug_key";

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_userId_key" ON "Category"("slug", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_slug_sellerId_key" ON "Medicine"("slug", "sellerId");
