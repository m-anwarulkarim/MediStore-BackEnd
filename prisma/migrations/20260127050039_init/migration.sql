/*
  Warnings:

  - You are about to alter the column `price` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `discountPrice` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `subtotal` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `deliveryCharge` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `discount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Medicine" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "discountPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "deliveryCharge" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);
