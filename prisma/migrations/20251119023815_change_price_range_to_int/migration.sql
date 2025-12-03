/*
  Warnings:

  - The `priceRange` column on the `restaurants` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "priceRange",
ADD COLUMN     "priceRange" INTEGER;

-- DropEnum
DROP TYPE "PriceRange";
