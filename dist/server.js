// src/app.ts
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
function getEnv(key, required = true) {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`\u274C Missing environment variable: ${key}`);
  }
  return value;
}
var env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  // PORT only for local/dev (not required in Vercel)
  PORT: process.env.PORT ? Number(process.env.PORT) : void 0,
  DATABASE_URL: getEnv("DATABASE_URL"),
  URL: getEnv("URL"),
  FRONT_END_URL: getEnv("FRONT_END_URL"),
  BETTER_AUTH_SECRET: getEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnv("BETTER_AUTH_URL"),
  // Email
  APP_EMAIL: getEnv("APP_EMAIL"),
  APP_PASS: getEnv("APP_PASS"),
  // Google
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  // Admin (not required in production)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASS: process.env.ADMIN_PASS,
  ADMIN_NAME: process.env.ADMIN_NAME
};

// src/module/medicine/medicine.route.ts
import { Router } from "express";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// src/generated/prisma/enums.ts
var ROLE = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN"
};
var ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  PLACED: "PLACED"
};
var USER_STATUS = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  SUSPENDED: "SUSPENDED"
};
var PAYMENT_METHOD = {
  CASH_ON_DELIVERY: "CASH_ON_DELIVERY"
};

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma/"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// ==================\n// Enums\n// ==================\n\nenum ROLE {\n  CUSTOMER\n  SELLER\n  ADMIN\n}\n\nenum ORDER_STATUS {\n  PENDING\n  CONFIRMED\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n  PLACED\n}\n\nenum USER_STATUS {\n  ACTIVE\n  BANNED\n  SUSPENDED\n}\n\nenum PAYMENT_METHOD {\n  CASH_ON_DELIVERY\n}\n\n// ==================\n// Orders & Order Items\n// ==================\n\nmodel Order {\n  id            String         @id @default(cuid())\n  orderNumber   String         @unique\n  userId        String\n  addressId     String\n  status        ORDER_STATUS   @default(PENDING)\n  paymentMethod PAYMENT_METHOD @default(CASH_ON_DELIVERY)\n\n  subtotal       Decimal @db.Decimal(10, 2)\n  deliveryCharge Decimal @default(0) @db.Decimal(10, 2)\n  discount       Decimal @default(0) @db.Decimal(10, 2)\n  total          Decimal @db.Decimal(10, 2)\n\n  customerNote String?\n  cancelReason String?\n  deliveredAt  DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user       User        @relation(fields: [userId], references: [id])\n  address    Address     @relation(fields: [addressId], references: [id])\n  orderItems OrderItem[]\n\n  @@index([userId])\n  @@index([orderNumber])\n  @@index([status])\n}\n\nmodel OrderItem {\n  id         String  @id @default(cuid())\n  orderId    String\n  medicineId String\n  quantity   Int\n  price      Decimal @db.Decimal(10, 2) // Price at time of order\n\n  createdAt DateTime @default(now())\n\n  // Relations\n  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  medicine Medicine @relation(fields: [medicineId], references: [id])\n\n  @@index([orderId])\n}\n\n// ==================\n// Categories & Medicines (\u098F\u0995\u099F\u09BE \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u0985\u09A8\u09C7\u0995 \u09AE\u09C7\u09A1\u09BF\u09B8\u09BF\u09A8 \u09A5\u09BE\u0995\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7)\n// ==================\n\nmodel Category {\n  id          String   @id @default(cuid())\n  name        String\n  slug        String   @unique\n  description String?\n  image       String?\n  isActive    Boolean  @default(true)\n  userId      String\n  user        User     @relation(fields: [userId], references: [id])\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  // Relations\n  medicines Medicine[]\n\n  @@unique([slug, userId])\n  @@index([userId])\n}\n\nmodel Medicine {\n  id                   String    @id @default(cuid())\n  name                 String\n  slug                 String\n  description          String\n  manufacturer         String\n  price                Decimal   @db.Decimal(10, 2)\n  discountPrice        Decimal?  @db.Decimal(10, 2)\n  stock                Int       @default(0)\n  dosageForm           String?\n  strength             String?\n  prescriptionRequired Boolean   @default(false)\n  categoryId           String\n  sellerId             String\n  image                String?\n  images               String[]\n  isActive             Boolean   @default(true)\n  isFeatured           Boolean   @default(false)\n  tags                 String[]\n  rating               Decimal?  @db.Decimal(2, 1)\n  views                Int?      @default(0)\n  metaDescription      String?\n  deletedAt            DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  category   Category      @relation(fields: [categoryId], references: [id], onDelete: Restrict)\n  seller     SellerProfile @relation(fields: [sellerId], references: [id], onDelete: Cascade)\n  orderItems OrderItem[]\n  reviews    Review[]\n  cartItems  CartItem[]\n\n  // Unique & Indexes\n  @@unique([slug, sellerId])\n  @@index([slug])\n  @@index([categoryId])\n  @@index([sellerId])\n  @@index([isActive])\n  @@index([name]) // For search by name\n  @@index([manufacturer]) // For search by manufacturer\n}\n\n// ==================\n// Cart Item\n// ==================\n\nmodel CartItem {\n  id         String @id @default(cuid())\n  userId     String\n  medicineId String\n  quantity   Int    @default(1)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, medicineId])\n  @@index([userId])\n}\n\n// ==================\n// Reviews\n// ==================\n\nmodel Review {\n  id         String  @id @default(cuid())\n  userId     String\n  medicineId String\n  orderId    String? // Optional: link to order for verification\n  rating     Int // 1-5 stars\n  comment    String?\n  isVerified Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, medicineId])\n  @@index([medicineId])\n  @@index([rating])\n}\n\n// ==================\n// Address\n// ==================\n\nmodel Address {\n  id          String  @id @default(cuid())\n  userId      String\n  fullName    String\n  label       String? // Home, Office, etc.\n  phone       String\n  country     String  @default("Bangladesh")\n  city        String\n  state       String\n  area        String?\n  postalCode  String\n  addressLine String\n  isDefault   Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  orders Order[]\n\n  @@index([userId])\n}\n\n// ==================\n// User & SellerProfile\n// ==================\n\nmodel User {\n  id            String      @id @default(cuid())\n  name          String\n  email         String      @unique\n  emailVerified Boolean     @default(false)\n  image         String?\n  phone         String?\n  role          ROLE        @default(CUSTOMER)\n  status        USER_STATUS @default(ACTIVE)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  addresses     Address[]\n  order         Order[]\n  cart          CartItem[]\n  reviews       Review[]\n  sellerProfile SellerProfile?\n  sessions      Session[]\n  accounts      Account[]\n\n  category Category[]\n\n  @@index([role])\n  @@map("user")\n}\n\nmodel SellerProfile {\n  id              String  @id @default(cuid())\n  userId          String  @unique\n  shopName        String\n  shopDescription String?\n  shopLogo        String?\n  licenseNumber   String? @unique\n  isVerified      Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  medicines Medicine[]\n\n  @@index([userId])\n}\n\n// ==================\n// Sessions & Accounts\n// ==================\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"addressId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ORDER_STATUS"},{"name":"paymentMethod","kind":"enum","type":"PAYMENT_METHOD"},{"name":"subtotal","kind":"scalar","type":"Decimal"},{"name":"deliveryCharge","kind":"scalar","type":"Decimal"},{"name":"discount","kind":"scalar","type":"Decimal"},{"name":"total","kind":"scalar","type":"Decimal"},{"name":"customerNote","kind":"scalar","type":"String"},{"name":"cancelReason","kind":"scalar","type":"String"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToOrder"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToOrderItem"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CategoryToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"CategoryToMedicine"}],"dbName":null},"Medicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"manufacturer","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"discountPrice","kind":"scalar","type":"Decimal"},{"name":"stock","kind":"scalar","type":"Int"},{"name":"dosageForm","kind":"scalar","type":"String"},{"name":"strength","kind":"scalar","type":"String"},{"name":"prescriptionRequired","kind":"scalar","type":"Boolean"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"images","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"tags","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Decimal"},{"name":"views","kind":"scalar","type":"Int"},{"name":"metaDescription","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMedicine"},{"name":"seller","kind":"object","type":"SellerProfile","relationName":"MedicineToSellerProfile"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MedicineToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"MedicineToReview"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToMedicine"}],"dbName":null},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"CartItemToUser"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"CartItemToMedicine"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToReview"}],"dbName":null},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"label","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"state","kind":"scalar","type":"String"},{"name":"area","kind":"scalar","type":"String"},{"name":"postalCode","kind":"scalar","type":"String"},{"name":"addressLine","kind":"scalar","type":"String"},{"name":"isDefault","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AddressToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"AddressToOrder"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"ROLE"},{"name":"status","kind":"enum","type":"USER_STATUS"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"addresses","kind":"object","type":"Address","relationName":"AddressToUser"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"cart","kind":"object","type":"CartItem","relationName":"CartItemToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"sellerProfile","kind":"object","type":"SellerProfile","relationName":"SellerProfileToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToUser"}],"dbName":"user"},"SellerProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"shopName","kind":"scalar","type":"String"},{"name":"shopDescription","kind":"scalar","type":"String"},{"name":"shopLogo","kind":"scalar","type":"String"},{"name":"licenseNumber","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SellerProfileToUser"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"MedicineToSellerProfile"}],"dbName":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_URL"];
var optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "APP_EMAIL",
  "APP_PASS"
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      ` Missing required environment variable: ${envVar}
Please add ${envVar} to your .env file`
    );
  }
}
for (const envVar of optionalEnvVars) {
  if (!process.env[envVar]) {
    console.warn(
      `  Optional environment variable ${envVar} is not set. Some features may be disabled.`
    );
  }
}
var connectionString = process.env.DATABASE_URL;
if (!connectionString.startsWith("postgresql://") && !connectionString.startsWith("postgres://")) {
  throw new Error(
    " DATABASE_URL must be a valid PostgreSQL connection string\nExpected format: postgresql://user:password@host:port/database"
  );
}
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
prisma.$connect().then(() => {
  console.log("\u2705 Database connected successfully");
}).catch((error) => {
  console.error(" Database connection failed:", error.message);
  process.exit(1);
});
process.on("beforeExit", async () => {
  console.log("\u{1F50C} Disconnecting from database...");
  await prisma.$disconnect();
});
process.on("SIGINT", async () => {
  console.log("\n\u{1F50C} Received SIGINT. Disconnecting from database...");
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("\n\u{1F50C} Received SIGTERM. Disconnecting from database...");
  await prisma.$disconnect();
  process.exit(0);
});

// src/module/medicine/medicine.service.ts
import slugify from "slugify";
var createMedicine = async ({
  name,
  description,
  manufacturer,
  price,
  categoryId,
  userId,
  discountPrice,
  dosageForm,
  strength,
  prescriptionRequired,
  images
}) => {
  if (!userId) throw new Error("User id is required");
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId }
  });
  if (!sellerProfile) throw new Error("Seller profile not found");
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) throw new Error("Invalid category");
  if (discountPrice != null && discountPrice >= price)
    throw new Error("Discount price must be less than original price");
  const slug = slugify(name, { lower: true, strict: true, trim: true });
  const existingMedicine = await prisma.medicine.findUnique({
    where: { slug_sellerId: { slug, sellerId: sellerProfile.id } }
  });
  if (existingMedicine) throw new Error(`Medicine "${name}" already exists`);
  const result = await prisma.medicine.create({
    data: {
      name,
      slug,
      description,
      manufacturer,
      price,
      categoryId,
      sellerId: sellerProfile.id,
      discountPrice,
      dosageForm,
      strength,
      prescriptionRequired,
      images,
      isActive: true
    }
  });
  return result;
};
var getAllMedicine = async ({
  id,
  slug,
  categoryId,
  sellerId,
  isActive,
  page = 1,
  limit = 10,
  search,
  manufacturer,
  minPrice,
  maxPrice,
  sortBy = "createdAt",
  sortOrder = "desc"
}) => {
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  const where = {};
  where.isActive = typeof isActive === "boolean" ? isActive : true;
  if (id) where.id = id;
  if (slug) where.slug = slug;
  if (categoryId) where.categoryId = categoryId;
  if (sellerId) where.sellerId = sellerId;
  if (manufacturer) {
    where.manufacturer = { contains: manufacturer, mode: "insensitive" };
  }
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price.gte = minPrice;
    if (maxPrice != null) where.price.lte = maxPrice;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { manufacturer: { contains: search, mode: "insensitive" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      include: {
        category: true,
        seller: { select: { id: true, shopName: true, isVerified: true } },
        reviews: true
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    prisma.medicine.count({ where })
  ]);
  return {
    data: medicines,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};
var updateMedicine = async (data) => {
  const { medicineId, sellerId } = data;
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId }
  });
  if (!medicine) throw new Error("Medicine not found");
  if (medicine.sellerId !== sellerId)
    throw new Error("Unauthorized: You can only update your own medicines");
  const updateData = {};
  if (data.name && data.name !== medicine.name) {
    const slug = slugify(data.name, { lower: true, strict: true, trim: true });
    const existing = await prisma.medicine.findUnique({
      where: { slug_sellerId: { slug, sellerId } }
    });
    if (existing) throw new Error("Medicine with this name already exists");
    updateData.name = data.name;
    updateData.slug = slug;
  }
  if (data.description) updateData.description = data.description;
  if (data.manufacturer) updateData.manufacturer = data.manufacturer;
  if (data.price != null) updateData.price = data.price;
  if (data.discountPrice != null) updateData.discountPrice = data.discountPrice;
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) throw new Error("Invalid category");
    updateData.categoryId = data.categoryId;
  }
  if (data.dosageForm) updateData.dosageForm = data.dosageForm;
  if (data.strength) updateData.strength = data.strength;
  if (data.prescriptionRequired != null)
    updateData.prescriptionRequired = data.prescriptionRequired;
  if (data.images) updateData.images = data.images;
  const updatedMedicine = await prisma.medicine.update({
    where: { id: medicineId },
    data: updateData
  });
  return updatedMedicine;
};
var removeMedicine = async ({
  medicineId,
  sellerId
}) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true, sellerId: true, isActive: true }
  });
  if (!medicine || !medicine.isActive) {
    throw new Error("Medicine not found");
  }
  if (medicine.sellerId !== sellerId) {
    throw new Error("Unauthorized: You can only delete your own medicines");
  }
  await prisma.medicine.update({
    where: { id: medicineId },
    data: { isActive: false }
  });
  return { message: "Medicine deleted successfully" };
};
var getMedicineDetails = async (medicineId, reviewPage = 1, reviewLimit = 5) => {
  const skip = (reviewPage - 1) * reviewLimit;
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    include: {
      category: true,
      seller: { select: { id: true, shopName: true, isVerified: true } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        skip,
        take: reviewLimit,
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!medicine || !medicine.isActive) throw new Error("Medicine not found");
  const totalReviews = await prisma.review.count({ where: { medicineId } });
  return { ...medicine, reviewPage, reviewLimit, totalReviews };
};
var updateStock = async ({
  medicineId,
  sellerId,
  // SellerProfile.id
  stock
}) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true, sellerId: true, isActive: true, stock: true }
  });
  if (!medicine || !medicine.isActive) throw new Error("Medicine not found");
  if (medicine.sellerId !== sellerId) {
    throw new Error("Unauthorized: You can only update your own medicines");
  }
  const updated = await prisma.medicine.update({
    where: { id: medicineId },
    data: { stock }
  });
  return updated;
};
var medicineService = {
  createMedicine,
  getAllMedicine,
  updateMedicine,
  removeMedicine,
  getMedicineDetails,
  updateStock
};

// src/module/medicine/medicine.controller.ts
var createMedicine2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can add medicines"
      });
    }
    const { name, description, manufacturer, price, categoryId } = req.body;
    if (!name || !description || !manufacturer || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, description, manufacturer, price, categoryId"
      });
    }
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0"
      });
    }
    const data = await medicineService.createMedicine({
      ...req.body,
      userId: user.id
    });
    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      data
    });
  } catch (error) {
    console.error("Create medicine error:", error);
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes("not found") || error.message.includes("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create medicine"
    });
  }
};
var getAllMedicine2 = async (req, res) => {
  try {
    const {
      id,
      slug,
      categoryId,
      sellerId,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      manufacturer,
      minPrice,
      maxPrice
    } = req.query;
    const { isActive } = req.query;
    const parsedIsActive = isActive === "true" ? true : isActive === "false" ? false : void 0;
    const parsedMinPrice = minPrice != null && minPrice !== "" ? Number(minPrice) : void 0;
    const parsedMaxPrice = maxPrice != null && maxPrice !== "" ? Number(maxPrice) : void 0;
    const data = await medicineService.getAllMedicine({
      id,
      slug,
      categoryId,
      sellerId,
      page: page ? parseInt(page) : void 0,
      limit: limit ? parseInt(limit) : void 0,
      search,
      manufacturer,
      minPrice: Number.isFinite(parsedMinPrice) ? parsedMinPrice : void 0,
      maxPrice: Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : void 0,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      isActive: parsedIsActive
    });
    return res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      ...data
    });
  } catch (error) {
    console.error("Get medicines error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines"
    });
  }
};
var getMyMedicines = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!sellerProfile)
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    const { categoryId, page, limit, search, sortBy, sortOrder, isActive } = req.query;
    const parsedIsActive = isActive === "true" ? true : isActive === "false" ? false : void 0;
    const data = await medicineService.getAllMedicine({
      sellerId: sellerProfile.id,
      categoryId,
      isActive: parsedIsActive,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc"
    });
    return res.status(200).json({
      success: true,
      message: "Seller medicines fetched successfully",
      ...data
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to fetch seller medicines" });
  }
};
var getMedicineDetails2 = async (req, res) => {
  try {
    const { medicineId } = req.params;
    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required"
      });
    }
    const reviewPage = req.query.reviewPage ? parseInt(req.query.reviewPage) : 1;
    const reviewLimit = req.query.reviewLimit ? parseInt(req.query.reviewLimit) : 5;
    const data = await medicineService.getMedicineDetails(
      medicineId,
      reviewPage,
      reviewLimit
    );
    return res.status(200).json({
      success: true,
      message: "Medicine details fetched successfully",
      data
    });
  } catch (error) {
    console.error("Get medicine details error:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine details"
    });
  }
};
var updateMedicine2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update medicines"
      });
    }
    const { medicineId } = req.params;
    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required"
      });
    }
    if (req.body.price !== void 0 && req.body.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0"
      });
    }
    if (req.body.stock !== void 0 && req.body.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number"
      });
    }
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found"
      });
    }
    const updatedMedicine = await medicineService.updateMedicine({
      medicineId,
      sellerId: sellerProfile.id,
      //  FIXED
      ...req.body
    });
    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine
    });
  } catch (error) {
    console.error("Update medicine error:", error);
    if (error.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message?.includes("Unauthorized") || error.message?.includes("already exists") || error.message?.includes("Invalid")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update medicine"
    });
  }
};
var deleteMedicine = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can delete medicines"
      });
    }
    const rawMedicineId = req.params.medicineId;
    const medicineId = Array.isArray(rawMedicineId) ? rawMedicineId[0] : rawMedicineId;
    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required"
      });
    }
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found"
      });
    }
    const result = await medicineService.removeMedicine({
      medicineId,
      sellerId: sellerProfile.id
    });
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Delete medicine error:", error);
    if (error.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message?.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete medicine"
    });
  }
};
var updateStock2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({ success: false, message: "Only sellers can update stock" });
    }
    const { medicineId } = req.params;
    const { stock } = req.body;
    if (!medicineId) {
      return res.status(400).json({ success: false, message: "Medicine ID is required" });
    }
    if (typeof stock !== "number" || Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number"
      });
    }
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!sellerProfile) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }
    const updated = await medicineService.updateStock({
      medicineId,
      sellerId: sellerProfile.id,
      stock
    });
    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: updated
    });
  } catch (error) {
    if (error.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message?.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to update stock" });
  }
};
var medicineController = {
  createMedicine: createMedicine2,
  getAllMedicine: getAllMedicine2,
  getMedicineDetails: getMedicineDetails2,
  updateMedicine: updateMedicine2,
  deleteMedicine,
  updateStock: updateStock2,
  getMyMedicines
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer from "nodemailer";
var normalizeOrigin = (u) => u ? u.replace(/\/$/, "") : "";
var isHttps = (u) => Boolean(u && u.startsWith("https://"));
var isProd = env.NODE_ENV === "production" || isHttps(env.BETTER_AUTH_URL) || isHttps(env.FRONT_END_URL);
var trustedOrigins = [normalizeOrigin(env.FRONT_END_URL)].filter(Boolean);
var hasEmailCreds = Boolean(env.APP_EMAIL && env.APP_PASS);
var transporter = hasEmailCreds ? nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: env.APP_EMAIL,
    pass: env.APP_PASS
  },
  connectionTimeout: 1e4,
  greetingTimeout: 5e3
}) : null;
if (!isProd && transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error("Email transporter verification failed:", error);
    } else {
      console.log("Email transporter is ready");
    }
  });
}
var queueFailedEmail = async (userId, email, type, url, error) => {
  console.error("Email queued for retry:", {
    userId,
    email,
    type,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    error: error instanceof Error ? error.message : error
  });
};
var sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  if (!transporter) return false;
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully (attempt ${attempt}):`,
        info.messageId
      );
      return true;
    } catch (error) {
      lastError = error;
      console.error(
        `Email send failed (attempt ${attempt}/${maxRetries}):`,
        error instanceof Error ? error.message : error
      );
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1e3;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
  console.error("All email send attempts failed:", lastError);
  return false;
};
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: normalizeOrigin(env.BETTER_AUTH_URL),
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    // 7 days
    updateAge: 60 * 60 * 24,
    // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60
    }
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      httpOnly: true,
      path: "/"
    }
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent"
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!hasEmailCreds || !transporter) {
        console.warn(
          "Email credentials not configured. Skipping verification email."
        );
        return;
      }
      const mailOptions = {
        from: `"MediStore" <${env.APP_EMAIL}>`,
        to: user.email,
        subject: "Verify your email address - MediStore",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
              Email Verification
            </h2>
            <p style="color: #555; font-size: 16px;">Hello ${user.name || "User"},</p>
            <p style="color: #555; font-size: 16px;">
              Thank you for signing up for MediStore! Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a
                href="${url}"
                target="_blank"
                style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"
              >
                Verify Email
              </a>
            </div>
            <p style="color: #777; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #4CAF50; word-break: break-all; font-size: 14px;">${url}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request this verification, you can safely ignore this email.
            </p>
          </div>
        `
      };
      const success = await sendEmailWithRetry(mailOptions);
      if (!success) {
        await queueFailedEmail(
          user.id,
          user.email,
          "VERIFICATION",
          url,
          new Error("All retry attempts failed")
        );
        console.warn("User signed up but verification email failed.");
      }
    }
  }
});

// src/guard/auth.guard.ts
var authGuard = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Please login"
        });
      }
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }
      if (user?.status !== USER_STATUS.ACTIVE) {
        return res.status(403).json({
          success: false,
          message: "Account is not active"
        });
      }
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions"
        });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth Guard Error:", error);
      return res.status(500).json({
        success: false,
        message: "Authentication failed"
      });
    }
  };
};
var auth_guard_default = authGuard;

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
var REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
var ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15d";
var REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "30d";
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "JWT secrets missing. Set JWT_ACCESS_SECRET & JWT_REFRESH_SECRET in .env"
  );
}
var signAccessToken = (payload) => {
  const options = { expiresIn: ACCESS_EXPIRES };
  return jwt.sign(payload, ACCESS_SECRET, options);
};
var signRefreshToken = (payload) => {
  const options = { expiresIn: REFRESH_EXPIRES };
  return jwt.sign(payload, REFRESH_SECRET, options);
};
var verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};
var verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// src/guard/jwt.guard.ts
var JwtGuard = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Missing Bearer token"
        });
      }
      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub }
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }
      if (user.status !== USER_STATUS.ACTIVE) {
        return res.status(403).json({
          success: false,
          message: "Account is not active"
        });
      }
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions"
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token"
      });
    }
  };
};
var jwt_guard_default = JwtGuard;

// src/module/medicine/medicine.route.ts
var router = Router();
router.get("/", medicineController.getAllMedicine);
router.get(
  "/seller/my",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  medicineController.getMyMedicines
);
router.get("/:medicineId", jwt_guard_default(), medicineController.getMedicineDetails);
router.post(
  "/",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  medicineController.createMedicine
);
router.put(
  "/:medicineId",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  medicineController.updateMedicine
);
router.delete(
  "/:medicineId",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  medicineController.deleteMedicine
);
router.patch(
  "/:medicineId/stock",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  medicineController.updateStock
);
var medicineRouter = router;

// src/module/categories/categories.route.ts
import { Router as Router2 } from "express";

// src/ui/slugify.ts
function slugify2(text) {
  if (!text || typeof text !== "string") {
    return "";
  }
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+|-+$/g, "");
}

// src/module/categories/categories.service.ts
var createCategories = async (name, userId, slug, image, description) => {
  try {
    let safeSlug;
    if (slug && typeof slug === "string") {
      safeSlug = slugify2(slug);
    } else if (name) {
      safeSlug = slugify2(name);
    } else {
      throw new Error("Category name is required");
    }
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug: safeSlug }]
      }
    });
    if (existingCategory) {
      throw new Error("Category with this name or slug already exists");
    }
    const result = await prisma.category.create({
      data: {
        name,
        slug: safeSlug,
        userId,
        image,
        description
      }
    });
    return result;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};
var getAllCategory = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { medicines: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return categories;
  } catch (error) {
    console.error("Get all category service error:", error);
    throw new Error("Failed to fetch categories");
  }
};
var updateCategory = async (categoryId, updateData) => {
  const { name, slug, image, description } = updateData;
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!existingCategory) {
      throw new Error("Category not found");
    }
    let safeSlug = void 0;
    if (slug) {
      safeSlug = slugify2(slug);
    } else if (name) {
      safeSlug = slugify2(name);
    }
    if (name || safeSlug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          id: { not: categoryId },
          OR: [
            ...name ? [{ name }] : [],
            ...safeSlug ? [{ slug: safeSlug }] : []
          ]
        }
      });
      if (duplicate) {
        throw new Error("Category with this name or slug already exists");
      }
    }
    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...name && { name },
        ...safeSlug && { slug: safeSlug },
        ...image !== void 0 && { image },
        ...description !== void 0 && { description }
      }
    });
  } catch (error) {
    console.error("Error updating category in service:", error);
    throw error;
  }
};
var deleteCategory = async (categoryId) => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { medicines: true }
        }
      }
    });
    if (!existingCategory) {
      throw new Error("Category not found");
    }
    if (existingCategory._count.medicines > 0) {
      throw new Error(
        "Cannot delete category: It contains linked medicines. Remove medicines first."
      );
    }
    const result = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: false
      }
    });
    return result;
  } catch (error) {
    console.error("Error in deleteCategory service:", error);
    throw error;
  }
};
var getSingleCategory = async (id) => {
  try {
    const result = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicines: true }
        }
      }
    });
    if (!result) {
      throw new Error("Category not found");
    }
    return result;
  } catch (error) {
    console.error("Error fetching single category:", error);
    throw error;
  }
};
var CategoriesService = {
  createCategories,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory
};

// src/module/categories/categories.controller.ts
var createCategories2 = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only admins and sellers can create categories"
      });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    const data = await CategoriesService.createCategories(
      name.trim(),
      user.id,
      slug,
      image,
      description
    );
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(error.message.includes("already exists") ? 409 : 500).json({
      success: false,
      message: error.message || "Failed to create category"
    });
  }
};
var getAllCategory2 = async (req, res) => {
  try {
    const data = await CategoriesService.getAllCategory();
    return res.status(200).json({
      success: true,
      message: data.length === 0 ? "No categories found" : "Categories retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const user = req.user;
    const { name, slug, image, description } = req.body;
    const categoryId = req.params.id;
    if (!user || user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const updatedCategory = await CategoriesService.updateCategory(
      categoryId,
      {
        name: name?.trim(),
        slug,
        image,
        description
      }
    );
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    console.error("Update controller error:", error);
    const status2 = error.message.includes("not found") ? 404 : error.message.includes("exists") ? 409 : 500;
    return res.status(status2).json({
      success: false,
      message: error.message || "Failed to update category"
    });
  }
};
var deleteCategory2 = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    if (!user || user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin or Seller access required"
      });
    }
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }
    const data = await CategoriesService.deleteCategory(id);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data
    });
  } catch (error) {
    console.error("Error in deleteCategory controller:", error);
    let statusCode = 500;
    if (error.message.includes("not found")) statusCode = 404;
    if (error.message.includes("linked medicines")) statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "An error occurred while deleting the category"
    });
  }
};
var getSingleCategory2 = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await CategoriesService.getSingleCategory(
      categoryId
    );
    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: { category }
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch category details"
    });
  }
};
var CategoriesController = {
  createCategories: createCategories2,
  getAllCategory: getAllCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2,
  getSingleCategory: getSingleCategory2
};

// src/module/categories/categories.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth_guard_default(ROLE.ADMIN, ROLE.SELLER),
  jwt_guard_default(),
  CategoriesController.createCategories
);
router2.get("/", CategoriesController.getAllCategory);
router2.patch(
  "/:id",
  auth_guard_default(ROLE.ADMIN, ROLE.SELLER),
  jwt_guard_default(),
  CategoriesController.updateCategory
);
router2.delete(
  "/:id",
  auth_guard_default(ROLE.ADMIN, ROLE.SELLER),
  jwt_guard_default(),
  CategoriesController.deleteCategory
);
router2.get("/:id", CategoriesController.getSingleCategory);
var categoriesRouter = router2;

// src/module/SellerProfile/sellerProfile.route.ts
import { Router as Router3 } from "express";

// src/module/SellerProfile/sellerProfile.service.ts
var createSellerProfile = async ({
  userId,
  shopName,
  shopDescription,
  licenseNumber
}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== ROLE.SELLER) {
      throw new Error("User is not a seller");
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new Error("User is not active");
    }
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId }
    });
    if (existingProfile) {
      throw new Error("Seller profile already exists");
    }
    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        userId,
        shopName,
        shopDescription,
        licenseNumber
      }
    });
    return sellerProfile;
  } catch (error) {
    console.error("Create seller profile service error:", error);
    throw error;
  }
};
var updateSellerProfile = async ({
  userId,
  shopName,
  shopDescription,
  shopLogo,
  licenseNumber
}) => {
  try {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId }
    });
    if (!sellerProfile) {
      throw new Error("Seller profile not found");
    }
    if (licenseNumber) {
      const existingLicense = await prisma.sellerProfile.findFirst({
        where: {
          licenseNumber,
          NOT: { id: sellerProfile.id }
        }
      });
      if (existingLicense) {
        throw new Error("License number already in use");
      }
    }
    if (!userId) {
      throw new Error("User id is required");
    }
    if (!shopName && !shopDescription && !shopLogo && !licenseNumber) {
      throw new Error("Nothing to update");
    }
    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: sellerProfile.id },
      data: {
        shopName,
        shopDescription,
        shopLogo,
        licenseNumber
      }
    });
    return updatedProfile;
  } catch (error) {
    console.error("Update seller profile service error:", error);
    throw error;
  }
};
var getCurrentSellerProfile = async (userId) => {
  try {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        medicines: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });
    if (!sellerProfile) {
      throw new Error("Seller profile not found");
    }
    return sellerProfile;
  } catch (error) {
    console.error("Get current seller profile service error:", error);
    throw error;
  }
};
var getAllSellers = async () => {
  try {
    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true
          }
        },
        _count: {
          select: {
            medicines: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return sellers.map((seller) => ({
      id: seller.id,
      shopName: seller.shopName,
      shopDescription: seller.shopDescription,
      shopLogo: seller.shopLogo,
      licenseNumber: seller.licenseNumber,
      isVerified: seller.isVerified,
      createdAt: seller.createdAt,
      user: seller.user,
      totalMedicines: seller._count.medicines
    }));
  } catch (error) {
    console.error("Get all sellers service error:", error);
    throw error;
  }
};
var sellerProfileService = {
  createSellerProfile,
  updateSellerProfile,
  getCurrentSellerProfile,
  getAllSellers
};

// src/module/SellerProfile/sellerProfile.controller.ts
var createSellerProfile2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login."
      });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create seller profile"
      });
    }
    const { shopName, shopDescription, licenseNumber } = req.body;
    if (!shopName) {
      return res.status(400).json({
        success: false,
        message: "shopName is required"
      });
    }
    const sellerProfile = await sellerProfileService.createSellerProfile({
      userId: user.id,
      shopName,
      shopDescription,
      licenseNumber
    });
    return res.status(201).json({
      success: true,
      message: "Seller profile created successfully",
      data: sellerProfile
    });
  } catch (error) {
    console.error("Create seller profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create seller profile"
    });
  }
};
var updateSellerProfile2 = async (req, res) => {
  try {
    const user = req.user;
    const { shopName, shopDescription, shopLogo, licenseNumber } = req.body;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login."
      });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update seller profile"
      });
    }
    if (!shopName && !shopDescription && !shopLogo && !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update"
      });
    }
    const updatedProfile = await sellerProfileService.updateSellerProfile({
      userId: user.id,
      shopName,
      shopDescription,
      shopLogo,
      licenseNumber
    });
    return res.status(200).json({
      success: true,
      message: "Seller profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Update seller profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update seller profile"
    });
  }
};
var getCurrentSellerProfile2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login."
      });
    }
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access seller profile"
      });
    }
    const sellerProfile = await sellerProfileService.getCurrentSellerProfile(
      user.id
    );
    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Seller profile fetched successfully",
      data: sellerProfile
    });
  } catch (error) {
    console.error("Get current seller profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller profile"
    });
  }
};
var getAllSellers2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login."
      });
    }
    if (user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin can access all sellers"
      });
    }
    const sellers = await sellerProfileService.getAllSellers();
    return res.status(200).json({
      success: true,
      message: "All sellers fetched successfully",
      data: sellers
    });
  } catch (error) {
    console.error("Get all sellers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sellers"
    });
  }
};
var sellerProfileController = {
  createSellerProfile: createSellerProfile2,
  updateSellerProfile: updateSellerProfile2,
  getCurrentSellerProfile: getCurrentSellerProfile2,
  getAllSellers: getAllSellers2
};

// src/module/SellerProfile/sellerProfile.route.ts
var router3 = Router3();
router3.get(
  "/all",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  sellerProfileController.getAllSellers
);
router3.post(
  "/profile",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  sellerProfileController.createSellerProfile
);
router3.get(
  "/profile",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  sellerProfileController.getCurrentSellerProfile
);
router3.put(
  "/profile",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  sellerProfileController.updateSellerProfile
);
var sellerRouter = router3;

// src/module/order/orders.route.ts
import { Router as Router4 } from "express";

// src/module/order/orders.controller.ts
import status from "http-status";

// src/types/VALID_TRANSITIONS.ts
var VALID_TRANSITIONS = {
  [ORDER_STATUS.PLACED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: []
};
var VALID_TRANSITIONS_default = VALID_TRANSITIONS;

// src/ui/generateOrderNumber.ts
var generateOrderNumber = () => {
  const date = /* @__PURE__ */ new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9e3) + 1e3;
  return `ORD${ymd}-${random}`;
};

// src/module/order/orders.service.ts
var createOrderFromCart = async ({
  userId,
  addressId,
  customerNote
}) => {
  return await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { medicine: true }
    });
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }
    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.medicine.isActive) {
        throw new Error(`${item.medicine.name} is not available`);
      }
      if (item.medicine.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.medicine.name}. Only ${item.medicine.stock} available`
        );
      }
      const price = item.medicine.discountPrice ?? item.medicine.price;
      subtotal += Number(price) * item.quantity;
    }
    const deliveryCharge = 0;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;
    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber: generateOrderNumber(),
        subtotal,
        deliveryCharge,
        discount,
        total,
        customerNote,
        status: ORDER_STATUS.PLACED,
        paymentMethod: PAYMENT_METHOD.CASH_ON_DELIVERY,
        orderItems: {
          create: cartItems.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.medicine.discountPrice ?? item.medicine.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                image: true,
                slug: true
              }
            }
          }
        },
        address: true
      }
    });
    await Promise.all(
      cartItems.map(
        (item) => tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    );
    const cartItemIds = cartItems.map((item) => item.id);
    await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
    return order;
  });
};
var getOrderDetails = async (orderId, userId, role) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              image: true,
              slug: true,
              sellerId: true
            }
          }
        }
      },
      address: true,
      user: { select: { id: true, name: true, email: true } }
    }
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (role === ROLE.CUSTOMER && order.userId !== userId) {
    throw new Error("Unauthorized to view this order");
  }
  if (role === ROLE.SELLER) {
    const hasSellerItem = order.orderItems.some(
      (item) => item.medicine.sellerId === userId
    );
    if (!hasSellerItem) {
      throw new Error("Unauthorized to view this order");
    }
  }
  return order;
};
var getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              image: true,
              slug: true
            }
          }
        }
      },
      address: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var getSellerOrders = async (sellerProfileId) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { medicine: { sellerId: sellerProfileId } },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true
        }
      },
      medicine: {
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          slug: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const grouped = {};
  for (const item of orderItems) {
    const orderId = item.orderId;
    if (!grouped[orderId]) {
      grouped[orderId] = {
        ...item.order,
        orderItems: []
      };
    }
    grouped[orderId].orderItems.push(item);
  }
  const result = Object.values(grouped);
  result.sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return db - da;
  });
  return result;
};
var updateOrderStatus = async ({
  orderId,
  status: status2,
  userRole,
  userId
}) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            medicine: true
          }
        }
      }
    });
    if (!order) {
      throw new Error("Order not found");
    }
    const allowedTransitions = VALID_TRANSITIONS_default[order.status];
    if (!allowedTransitions.includes(status2)) {
      throw new Error(
        `Cannot change order status from ${order.status} to ${status2}`
      );
    }
    if (userRole === ROLE.CUSTOMER) {
      if (order.userId !== userId) {
        throw new Error("Unauthorized to update this order");
      }
      if (status2 !== ORDER_STATUS.CANCELLED) {
        throw new Error("Customers can only cancel orders");
      }
      if (order.status !== ORDER_STATUS.PLACED) {
        throw new Error("Can only cancel orders that are in PLACED status");
      }
    }
    if (userRole === ROLE.SELLER) {
      const sellerItem = await tx.orderItem.findFirst({
        where: {
          orderId,
          medicine: { sellerId: userId }
        },
        select: { id: true }
      });
      if (!sellerItem) {
        throw new Error("Unauthorized to update this order");
      }
      if (status2 === ORDER_STATUS.CANCELLED) {
        throw new Error("Sellers cannot cancel orders");
      }
      const allowedSellerStatuses = [
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.DELIVERED
      ];
      if (!allowedSellerStatuses.includes(status2)) {
        throw new Error(`Invalid status update for seller: ${status2}`);
      }
    }
    if (status2 === ORDER_STATUS.CANCELLED) {
      await Promise.all(
        order.orderItems.map(
          (item) => tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { increment: item.quantity } }
          })
        )
      );
    }
    const deliveredAt = status2 === ORDER_STATUS.DELIVERED ? /* @__PURE__ */ new Date() : order.deliveredAt;
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: status2,
        deliveredAt,
        // Set cancelReason if needed (you can add this to payload)
        ...status2 === ORDER_STATUS.CANCELLED && {
          cancelReason: "Cancelled by user"
        }
      },
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        address: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });
    return updatedOrder;
  });
};
var getAllOrdersForAdmin = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      address: true,
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              image: true,
              sellerId: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var orderService = {
  createOrderFromCart,
  getOrderDetails,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  getAllOrdersForAdmin
};

// src/module/order/orders.controller.ts
var createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { addressId, customerNote } = req.body;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const order = await orderService.createOrderFromCart({
      userId: user.id,
      addressId,
      customerNote
    });
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var getOrderDetails2 = async (req, res) => {
  try {
    const user = req.user;
    const { orderId } = req.params;
    if (!user) {
      return res.status(status.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized"
      });
    }
    let actorId = user.id;
    if (user.role === ROLE.SELLER) {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });
      if (!sellerProfile) {
        return res.status(status.NOT_FOUND).json({
          success: false,
          message: "Seller profile not found"
        });
      }
      actorId = sellerProfile.id;
    }
    const order = await orderService.getOrderDetails(
      orderId,
      actorId,
      user.role
    );
    return res.status(status.OK).json({
      success: true,
      data: order
    });
  } catch (error) {
    const msg = error?.message || "Failed to fetch order";
    let code = status.BAD_REQUEST;
    if (msg.includes("Unauthorized")) code = status.FORBIDDEN;
    else if (msg.includes("not found")) code = status.NOT_FOUND;
    return res.status(code).json({
      success: false,
      message: msg
    });
  }
};
var getUserOrders2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await orderService.getUserOrders(user.id);
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var getSellerOrders2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== ROLE.SELLER) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!sellerProfile) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }
    const orders = await orderService.getSellerOrders(sellerProfile.id);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
var updateOrderStatus2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const rawOrderId = req.params?.orderId;
    const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
    const { status: status2 } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }
    if (!status2) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    let actorId = user.id;
    if (user.role === ROLE.SELLER) {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });
      if (!sellerProfile) {
        return res.status(404).json({
          success: false,
          message: "Seller profile not found"
        });
      }
      actorId = sellerProfile.id;
    }
    const updatedOrder = await orderService.updateOrderStatus({
      orderId,
      status: status2,
      userRole: user.role,
      userId: actorId
      //  for seller it's sellerProfile.id
    });
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var getAllOrdersForAdmin2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const orders = await orderService.getAllOrdersForAdmin();
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var orderController = {
  createOrder,
  getOrderDetails: getOrderDetails2,
  getUserOrders: getUserOrders2,
  getSellerOrders: getSellerOrders2,
  updateOrderStatus: updateOrderStatus2,
  getAllOrdersForAdmin: getAllOrdersForAdmin2
};

// src/module/order/orders.route.ts
var router4 = Router4();
router4.get(
  "/admin/all",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  orderController.getAllOrdersForAdmin
);
router4.get(
  "/seller/all",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  orderController.getSellerOrders
);
router4.post(
  "/",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  orderController.createOrder
);
router4.get(
  "/my-orders",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  orderController.getUserOrders
);
router4.get(
  "/:orderId",
  auth_guard_default(ROLE.CUSTOMER, ROLE.SELLER, ROLE.ADMIN),
  jwt_guard_default(),
  orderController.getOrderDetails
);
router4.patch(
  "/:orderId/status",
  auth_guard_default(ROLE.SELLER, ROLE.ADMIN),
  jwt_guard_default(),
  orderController.updateOrderStatus
);
var OrderRouter = router4;

// src/module/Address/address.route.ts
import { Router as Router5 } from "express";

// src/module/Address/address.service.ts
var cleanOpt = (v) => {
  if (typeof v !== "string") return void 0;
  const s = v.trim();
  return s.length ? s : void 0;
};
var createAddress = async (input) => {
  const {
    userId,
    fullName,
    phone,
    country = "Bangladesh",
    city,
    state,
    area,
    postalCode,
    addressLine,
    label,
    isDefault = false
  } = input;
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }
  const data = {
    userId,
    fullName,
    country,
    isDefault,
    phone: cleanOpt(phone),
    city: cleanOpt(city),
    state: cleanOpt(state),
    //  state=String হলে এখানে undefined হয়ে যাবে
    area: cleanOpt(area),
    postalCode: cleanOpt(postalCode),
    addressLine: cleanOpt(addressLine),
    label: cleanOpt(label)
  };
  for (const k of Object.keys(data)) {
    if (data[k] === void 0) delete data[k];
  }
  const address = await prisma.address.create({ data });
  return address;
};
var updateAddress = async (input) => {
  const { id, userId, isDefault, ...rest } = input;
  const existingAddress = await prisma.address.findUnique({ where: { id } });
  if (!existingAddress) throw new Error("Address not found");
  if (existingAddress.userId !== userId)
    throw new Error("Unauthorized to update this address");
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: id } },
      data: { isDefault: false }
    });
  }
  const data = {};
  for (const [k, v] of Object.entries(rest)) {
    const cleaned = cleanOpt(v);
    if (cleaned !== void 0) data[k] = cleaned;
  }
  if (isDefault !== void 0) data.isDefault = isDefault;
  return prisma.address.update({ where: { id }, data });
};
var deleteAddress = async (addressId, userId) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId }
  });
  if (!address) throw new Error("Address not found");
  if (address.userId !== userId)
    throw new Error("Unauthorized to delete this address");
  const deleted = await prisma.address.delete({
    where: { id: addressId }
  });
  return deleted;
};
var getAllAddresses = async () => {
  const addresses = await prisma.address.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });
  return addresses;
};
var getMyAddresses = async (userId) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  return addresses;
};
var getMyAddressById = async (userId, addressId) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId }
  });
  if (!address) throw new Error("Address not found");
  if (address.userId !== userId)
    throw new Error("Address not found or access denied");
  return address;
};
var addressService = {
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  getMyAddresses,
  getMyAddressById
};

// src/module/Address/address.controller.ts
var cleanOptionalString = (v) => {
  if (typeof v !== "string") return void 0;
  const s = v.trim();
  return s.length ? s : void 0;
};
var cleanRequiredString = (v) => {
  if (typeof v !== "string") return "";
  return v.trim();
};
var createAddress2 = async (req, res) => {
  try {
    console.log("REQ state:", req.body.state, typeof req.body.state);
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const fullName = cleanRequiredString(req.body.fullName);
    const phone = cleanRequiredString(req.body.phone);
    const city = cleanRequiredString(req.body.city);
    const addressLine = cleanRequiredString(req.body.addressLine);
    if (!fullName || !phone || !city || !addressLine) {
      return res.status(400).json({
        success: false,
        message: "Required fields: fullName, phone, city, addressLine"
      });
    }
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format"
      });
    }
    const address = await addressService.createAddress({
      userId: user.id,
      fullName,
      phone,
      country: cleanOptionalString(req.body.country) ?? "Bangladesh",
      city,
      //  optional fields (safe)
      state: cleanOptionalString(req.body.state),
      area: cleanOptionalString(req.body.area),
      postalCode: cleanOptionalString(req.body.postalCode),
      label: cleanOptionalString(req.body.label),
      addressLine,
      isDefault: Boolean(req.body.isDefault)
    });
    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address
    });
  } catch (error) {
    console.error("Create address error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create address"
    });
  }
};
var updateAddress2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const addressId = req.params.id;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required"
      });
    }
    const updatedAddress = await addressService.updateAddress({
      id: addressId,
      userId: user.id,
      fullName: cleanOptionalString(req.body.fullName),
      phone: cleanOptionalString(req.body.phone),
      country: cleanOptionalString(req.body.country),
      city: cleanOptionalString(req.body.city),
      state: cleanOptionalString(req.body.state),
      area: cleanOptionalString(req.body.area),
      postalCode: cleanOptionalString(req.body.postalCode),
      addressLine: cleanOptionalString(req.body.addressLine),
      label: cleanOptionalString(req.body.label),
      isDefault: typeof req.body.isDefault === "boolean" ? req.body.isDefault : void 0
    });
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress
    });
  } catch (error) {
    console.error("Update address error:", error);
    if (error.message.includes("not found") || error.message.includes("Unauthorized")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update address"
    });
  }
};
var deleteAddress2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const addressId = req.params.id;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required"
      });
    }
    const deletedAddress = await addressService.deleteAddress(
      addressId,
      user.id
    );
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: deletedAddress
    });
  } catch (error) {
    console.error("Delete address error:", error);
    if (error.message.includes("not found") || error.message.includes("Unauthorized")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete address"
    });
  }
};
var getAllAddresses2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    const addresses = await addressService.getAllAddresses();
    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses
    });
  } catch (error) {
    console.error("Get all addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses"
    });
  }
};
var getMyAddresses2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const addresses = await addressService.getMyAddresses(user.id);
    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses
    });
  } catch (error) {
    console.error("Get my addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses"
    });
  }
};
var getMyAddressById2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const addressId = req.params.id;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required"
      });
    }
    const address = await addressService.getMyAddressById(
      user.id,
      addressId
    );
    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address
    });
  } catch (error) {
    console.error("Get address by ID error:", error);
    if (error.message.includes("not found") || error.message.includes("access denied")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch address"
    });
  }
};
var addressController = {
  createAddress: createAddress2,
  updateAddress: updateAddress2,
  deleteAddress: deleteAddress2,
  getAllAddresses: getAllAddresses2,
  getMyAddresses: getMyAddresses2,
  getMyAddressById: getMyAddressById2
};

// src/module/Address/address.route.ts
var router5 = Router5();
router5.get(
  "/admin/all",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  addressController.getAllAddresses
);
router5.post("/", auth_guard_default(), jwt_guard_default(), addressController.createAddress);
router5.get("/my-addresses", auth_guard_default(), jwt_guard_default(), addressController.getMyAddresses);
router5.get("/:id", auth_guard_default(), jwt_guard_default(), addressController.getMyAddressById);
router5.put("/:id", auth_guard_default(), jwt_guard_default(), addressController.updateAddress);
router5.delete("/:id", auth_guard_default(), jwt_guard_default(), addressController.deleteAddress);
var addressRouter = router5;

// src/module/cartItem/cartItem.route.ts
import { Router as Router6 } from "express";

// src/module/cartItem/cartItem.service.ts
var createCartItem = async ({
  userId,
  medicineId,
  quantity = 1
}) => {
  return await prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.findUnique({
      where: { id: medicineId }
    });
    if (!medicine || !medicine.isActive) {
      throw new Error("Medicine not available");
    }
    const existingCartItem = await tx.cartItem.findUnique({
      where: {
        userId_medicineId: {
          userId,
          medicineId
        }
      }
    });
    const totalQuantityNeeded = existingCartItem ? existingCartItem.quantity + quantity : quantity;
    if (medicine.stock < totalQuantityNeeded) {
      throw new Error(
        `Insufficient stock. Only ${medicine.stock} items available`
      );
    }
    if (existingCartItem) {
      return await tx.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: {
            increment: quantity
          }
        },
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              stock: true,
              image: true,
              slug: true
            }
          }
        }
      });
    }
    return await tx.cartItem.create({
      data: {
        userId,
        medicineId,
        quantity
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            stock: true,
            image: true,
            slug: true
          }
        }
      }
    });
  });
};
var getMyCart = async (userId) => {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          stock: true,
          image: true,
          slug: true,
          isActive: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var deleteCartItem = async (cartItemId, userId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId }
  });
  if (!cartItem) {
    throw new Error("Cart item not found");
  }
  if (cartItem.userId !== userId) {
    throw new Error("Unauthorized to delete this cart item");
  }
  return await prisma.cartItem.delete({
    where: { id: cartItemId }
  });
};
var updateCartItemQuantity = async (cartItemId, userId, quantity) => {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }
  return await prisma.$transaction(async (tx) => {
    const cartItem = await tx.cartItem.findUnique({
      where: { id: cartItemId },
      include: { medicine: true }
    });
    if (!cartItem) {
      throw new Error("Cart item not found");
    }
    if (cartItem.userId !== userId) {
      throw new Error("Unauthorized to update this cart item");
    }
    if (!cartItem.medicine.isActive) {
      throw new Error("Medicine is no longer available");
    }
    if (cartItem.medicine.stock < quantity) {
      throw new Error(
        `Only ${cartItem.medicine.stock} items available in stock`
      );
    }
    return await tx.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            stock: true,
            image: true,
            slug: true
          }
        }
      }
    });
  });
};
var cartItemService = {
  createCartItem,
  getMyCart,
  deleteCartItem,
  updateCartItemQuantity
};

// src/module/cartItem/cartItem.controller.ts
var createCartItem2 = async (req, res) => {
  try {
    const user = req.user;
    const { medicineId, quantity } = req.body;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required"
      });
    }
    if (quantity && (quantity < 1 || quantity > 100)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 100"
      });
    }
    const cartItem = await cartItemService.createCartItem({
      userId: user.id,
      medicineId,
      quantity: quantity || 1
    });
    return res.status(201).json({
      success: true,
      message: "Added to cart successfully",
      data: cartItem
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    if (error.message.includes("not available") || error.message.includes("stock")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart"
    });
  }
};
var getMyCart2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const cartItems = await cartItemService.getMyCart(user.id);
    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cartItems
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};
var deleteCartItem2 = async (req, res) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required"
      });
    }
    await cartItemService.deleteCartItem(cartItemId, user.id);
    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully"
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    if (error.message.includes("not found") || error.message.includes("Unauthorized")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart"
    });
  }
};
var updateCartItemQuantity2 = async (req, res) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required"
      });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }
    if (quantity > 100) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot exceed 100"
      });
    }
    const updatedCartItem = await cartItemService.updateCartItemQuantity(
      cartItemId,
      user.id,
      quantity
    );
    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCartItem
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    if (error.message.includes("not found") || error.message.includes("Unauthorized")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes("stock")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
};
var cartItemController = {
  createCartItem: createCartItem2,
  getMyCart: getMyCart2,
  deleteCartItem: deleteCartItem2,
  updateCartItemQuantity: updateCartItemQuantity2
};

// src/module/cartItem/cartItem.route.ts
var router6 = Router6();
router6.post(
  "/",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  cartItemController.createCartItem
);
router6.get(
  "/",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  cartItemController.getMyCart
);
router6.put(
  "/:cartItemId",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  cartItemController.updateCartItemQuantity
);
router6.delete(
  "/:cartItemId",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  cartItemController.deleteCartItem
);
var cartItemRouter = router6;

// src/module/reviews/reviews.route.ts
import { Router as Router7 } from "express";

// src/module/reviews/reviews.service.ts
var createReview = async ({
  userId,
  medicineId,
  orderId,
  rating,
  comment
}) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  if (!comment || comment.trim().length === 0) {
    throw new Error("Review comment is required");
  }
  if (comment.trim().length < 10) {
    throw new Error("Review comment must be at least 10 characters");
  }
  if (comment.length > 1e3) {
    throw new Error("Review comment must not exceed 1000 characters");
  }
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      orderId,
      medicineId,
      order: { userId }
    },
    include: {
      order: true
    }
  });
  if (!orderItem) {
    throw new Error("You can only review medicines you have purchased");
  }
  if (orderItem.order.status !== ORDER_STATUS.DELIVERED) {
    throw new Error("You can only review after the order is delivered");
  }
  const existingReview = await prisma.review.findFirst({
    where: { userId, medicineId, orderId }
  });
  if (existingReview) {
    throw new Error("You have already reviewed this medicine for this order");
  }
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        userId,
        medicineId,
        orderId,
        rating,
        comment: comment?.trim() || null,
        isVerified: true
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        medicine: { select: { id: true, name: true } }
      }
    });
    const result = await tx.review.aggregate({
      where: { medicineId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    const avg = result._avg.rating;
    const count = result._count.rating;
    await tx.medicine.update({
      where: { id: medicineId },
      data: { rating: count === 0 ? null : Math.round((avg ?? 0) * 10) / 10 }
    });
    return created;
  });
  return review;
};
var updateMedicineRating = async (medicineId) => {
  const result = await prisma.review.aggregate({
    where: { medicineId },
    _avg: { rating: true },
    _count: { rating: true }
  });
  const avg = result._avg.rating;
  const count = result._count.rating;
  await prisma.medicine.update({
    where: { id: medicineId },
    data: {
      rating: count === 0 ? null : Math.round((avg ?? 0) * 10) / 10
    }
  });
};
var getMedicineReviews = async (medicineId) => {
  return await prisma.review.findMany({
    where: { medicineId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getSellerReviews = async (sellerId) => {
  return await prisma.review.findMany({
    where: { medicine: { sellerId } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      medicine: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var deleteReview = async (reviewId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { medicineId: true }
  });
  if (!review) {
    throw new Error("Review not found");
  }
  await prisma.review.delete({ where: { id: reviewId } });
  await updateMedicineRating(review.medicineId);
  return { message: "Review deleted successfully" };
};
var updateReview = async (reviewId, userId, rating, comment) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new Error("Review not found");
  }
  if (review.userId !== userId) {
    throw new Error("Unauthorized to update this review");
  }
  if (rating !== void 0 && (rating < 1 || rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }
  if (comment !== void 0) {
    if (comment.trim().length < 10) {
      throw new Error("Review comment must be at least 10 characters");
    }
    if (comment.length > 1e3) {
      throw new Error("Review comment must not exceed 1000 characters");
    }
  }
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...rating !== void 0 && { rating },
      ...comment !== void 0 && { comment: comment.trim() }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  await updateMedicineRating(review.medicineId);
  return updatedReview;
};
var getMyReview = async (userId, orderId, medicineId) => {
  return prisma.review.findFirst({
    where: {
      userId,
      orderId,
      medicineId
    }
  });
};
var reviewService = {
  createReview,
  getMedicineReviews,
  getSellerReviews,
  deleteReview,
  updateReview,
  getMyReview
};

// src/module/reviews/review.controller.ts
var createReview2 = async (req, res) => {
  try {
    const user = req.user;
    const { medicineId, orderId, rating, comment } = req.body;
    const review = await reviewService.createReview({
      userId: user.id,
      medicineId,
      orderId,
      rating,
      comment
    });
    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
var getMedicineReviews2 = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const reviews = await reviewService.getMedicineReviews(
      medicineId
    );
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
var getSellerReviews2 = async (req, res) => {
  try {
    const user = req.user;
    const reviews = await reviewService.getSellerReviews(user.id);
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
var deleteReview2 = async (req, res) => {
  try {
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId);
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
var updateReview2 = async (req, res) => {
  try {
    const user = req.user;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const updated = await reviewService.updateReview(
      reviewId,
      user.id,
      rating,
      comment
    );
    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
var getMyReview2 = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, medicineId } = req.query;
    const review = await reviewService.getMyReview(
      user.id,
      String(orderId),
      String(medicineId)
    );
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var reviewController = {
  createReview: createReview2,
  getMedicineReviews: getMedicineReviews2,
  getSellerReviews: getSellerReviews2,
  deleteReview: deleteReview2,
  updateReview: updateReview2,
  getMyReview: getMyReview2
};

// src/module/reviews/reviews.route.ts
var router7 = Router7();
router7.get("/medicine/:medicineId", reviewController.getMedicineReviews);
router7.post(
  "/",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  reviewController.createReview
);
router7.patch(
  "/:reviewId",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  reviewController.updateReview
);
router7.get(
  "/seller/all",
  auth_guard_default(ROLE.SELLER),
  jwt_guard_default(),
  reviewController.getSellerReviews
);
router7.delete(
  "/:reviewId",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  reviewController.deleteReview
);
router7.get(
  "/my",
  auth_guard_default(ROLE.CUSTOMER),
  jwt_guard_default(),
  reviewController.getMyReview
);
var ReviewRouter = router7;

// src/module/manufacturer/manufacturer.route.ts
import { Router as Router8 } from "express";

// src/module/manufacturer/manufacturer.controller.ts
var getAllManufacturers = async (_req, res) => {
  try {
    const rows = await prisma.medicine.findMany({
      where: { isActive: true },
      select: { manufacturer: true },
      distinct: ["manufacturer"]
    });
    const data = rows.map((r) => r.manufacturer).filter(Boolean).sort((a, b) => a.localeCompare(b));
    return res.status(200).json({
      success: true,
      message: "Manufacturers fetched successfully",
      data
    });
  } catch (error) {
    console.error("Get manufacturers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch manufacturers"
    });
  }
};
var manufacturerController = {
  getAllManufacturers
};

// src/module/manufacturer/manufacturer.route.ts
var router8 = Router8();
router8.get("/", manufacturerController.getAllManufacturers);
var manufacturerRouter = router8;

// src/module/auth/auth.route.ts
import { Router as Router9 } from "express";

// src/module/auth/auth.service.ts
var getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users from database");
  }
};
var getCurrentUser = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users from database");
  }
};
var updatedUser = async (id, status2) => {
  try {
    const result = await prisma.user.update({
      where: {
        id
      },
      data: {
        status: status2
      }
    });
    return result;
  } catch (error) {
    console.error("Error Updating users:", error);
    throw new Error("Failed to Update users from database");
  }
};
var deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new Error("User not found");
  }
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: USER_STATUS.SUSPENDED
    }
  });
};
var updateUserRoleAndInitSellerProfile = async (id, role) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    if (user.status !== USER_STATUS.ACTIVE)
      throw new Error("User is not active");
    const updatedUser2 = await tx.user.update({
      where: { id },
      data: { role }
    });
    if (role === ROLE.SELLER) {
      const existingProfile = await tx.sellerProfile.findUnique({
        where: { userId: id }
      });
      if (!existingProfile) {
        await tx.sellerProfile.create({
          data: {
            userId: id,
            shopName: user.name ? `${user.name}'s Shop` : "My Shop",
            shopDescription: ""
          }
        });
      }
    }
    return updatedUser2;
  });
};
var userService = {
  getAllUsers,
  getCurrentUser,
  updatedUser,
  deleteUser,
  updateUserRoleAndInitSellerProfile
};

// src/module/auth/auth.controller.ts
var getAllUsers2 = async (req, res) => {
  try {
    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    const data = await userService.getAllUsers();
    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        data: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data
    });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users"
    });
  }
};
var getCurrentUser2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const data = await userService.getCurrentUser(user.id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data
    });
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user"
    });
  }
};
var updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: status2 } = req.body;
    if (!id || !status2) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required"
      });
    }
    if (!Object.values(USER_STATUS).includes(status2)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses: Object.values(USER_STATUS)
      });
    }
    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    const data = await userService.updatedUser(id, status2);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data
    });
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
};
var deleteUserByAdmin = async (req, res) => {
  try {
    const admin = req.user;
    const { userId } = req.params;
    if (!admin || admin.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    if (admin.id === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }
    await userService.deleteUser(userId);
    return res.status(200).json({
      success: true,
      message: "User account has been suspended"
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
};
var deleteMyAccount = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (user.role !== ROLE.SELLER && user.role !== ROLE.CUSTOMER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers and customers can delete their account"
      });
    }
    await userService.deleteUser(user.id);
    return res.status(200).json({
      success: true,
      message: "Your account has been deactivated"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account"
    });
  }
};
var updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await userService.updateUserRoleAndInitSellerProfile(
    id,
    role
  );
  return res.status(200).json({
    success: true,
    message: "User role updated (seller profile initialized if needed)",
    data: result
  });
};
var getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await userService.getCurrentUser(user.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "My profile fetched successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed" });
  }
};
var updateMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { name, phone, image } = req.body;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
        image
      }
    });
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed" });
  }
};
var logoutUser = async (req, res) => {
  const isProd2 = process.env.NODE_ENV === "production";
  res.clearCookie("better-auth.session_token", {
    httpOnly: true,
    secure: isProd2,
    sameSite: isProd2 ? "none" : "lax",
    path: "/"
  });
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};
var userController = {
  getAllUsers: getAllUsers2,
  getCurrentUser: getCurrentUser2,
  updateUser,
  deleteUserByAdmin,
  deleteMyAccount,
  updateUserRole,
  updateMyProfile,
  getMyProfile,
  logoutUser
};

// src/module/auth/auth.route.ts
var router9 = Router9();
router9.get(
  "/admin/users",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  userController.getAllUsers
);
router9.get("/auth", auth_guard_default(), jwt_guard_default(), userController.getCurrentUser);
router9.patch(
  "/admin/users/:id",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  userController.updateUser
);
router9.delete(
  "/admin/users/:userId",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  userController.deleteUserByAdmin
);
router9.delete(
  "/users/me",
  auth_guard_default(),
  jwt_guard_default(),
  userController.deleteMyAccount
);
router9.patch(
  "/admin/users/:id/role",
  auth_guard_default(ROLE.ADMIN),
  jwt_guard_default(),
  userController.updateUserRole
);
router9.get(
  "/users/me/profile",
  auth_guard_default(),
  jwt_guard_default(),
  userController.getMyProfile
);
router9.patch(
  "/users/me/profile",
  auth_guard_default(),
  jwt_guard_default(),
  userController.updateMyProfile
);
router9.post(
  "/users/logout",
  auth_guard_default(),
  jwt_guard_default(),
  userController.logoutUser
);
var userRouter = router9;

// src/module/jwt/jwt.route.ts
import { Router as Router10 } from "express";

// src/module/jwt/jwt.service.ts
import bcrypt from "bcryptjs";

// src/module/jwt/session.ts
async function getBetterAuthSession(req) {
  const headers = req?.headers;
  const apiGetSession = auth?.api?.getSession;
  if (typeof apiGetSession === "function") {
    return apiGetSession({ headers });
  }
  const getSession = auth?.getSession;
  if (typeof getSession === "function") {
    return getSession({ headers });
  }
  if (typeof apiGetSession === "function") {
    return apiGetSession(headers);
  }
  throw new Error(
    "better-auth session method not found. Check your lib/auth export."
  );
}

// src/module/jwt/jwt.service.ts
var HttpError = class extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
var sanitizeUser = (user) => {
  const { password, ...rest } = user ?? {};
  return rest;
};
var login = async (payload) => {
  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new HttpError(403, "Account is not active");
  }
  const hashed = user.password;
  if (!hashed) {
    throw new HttpError(400, "User password is not set");
  }
  const ok = await bcrypt.compare(password, hashed);
  if (!ok) {
    throw new HttpError(401, "Invalid email or password");
  }
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    role: user.role
  });
  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
};
var refresh = async (refreshToken) => {
  if (!refreshToken) throw new HttpError(401, "Refresh token required");
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new HttpError(401, "User not found");
  if (user.status !== USER_STATUS.ACTIVE) throw new HttpError(403, "Account is not active");
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role
  });
  return { accessToken };
};
var fromSession = async (req) => {
  const session = await getBetterAuthSession(req);
  const sessionUserId = session?.user?.id || session?.userId || session?.user?.userId;
  if (!sessionUserId) {
    throw new HttpError(401, "No active session");
  }
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId }
  });
  if (!user) {
    throw new HttpError(401, "User not found");
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new HttpError(403, "Account is not active");
  }
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role
  });
  return {
    user: sanitizeUser(user),
    accessToken
  };
};
var jwtService = {
  login,
  refresh,
  fromSession
};

// src/module/jwt/jwt.controller.ts
var login2 = async (req, res) => {
  try {
    const result = await jwtService.login(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken
      // refreshToken চাইলে client এ না দিয়ে cookie তে সেট করাই better
      // refreshToken: result.refreshToken,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Login failed"
    });
  }
};
var refresh2 = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await jwtService.refresh(refreshToken);
    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: result.accessToken
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || "Refresh failed"
    });
  }
};
var logout = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out (client should clear tokens)"
  });
};
var fromSession2 = async (req, res) => {
  try {
    const result = await jwtService.fromSession(req);
    return res.status(200).json({
      success: true,
      message: "JWT issued from session",
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || "Unauthorized"
    });
  }
};
var jwtController = {
  login: login2,
  refresh: refresh2,
  logout,
  fromSession: fromSession2
};

// src/module/jwt/jwt.route.ts
var router10 = Router10();
router10.post("/login", jwtController.login);
router10.post("/refresh", jwtController.refresh);
router10.post("/logout", jwtController.logout);
router10.post("/from-session", jwtController.fromSession);
var jwtRouter = router10;

// src/app.ts
var app = express();
app.set("trust proxy", 1);
var allowedOrigins = [
  env.FRONT_END_URL?.replace(/\/$/, ""),
  "https://medi-store-front-end.vercel.app",
  "http://localhost:3000"
  // "https://new-taka.shop",
  // "https://www.new-taka.shop"
].filter(Boolean);
var corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const cleaned = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleaned)) return cb(null, true);
    return cb(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});
app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));
app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "MediStore API is running"
  });
});
app.use("/api/jwt", jwtRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/products", medicineRouter);
app.use("/api/manufacturers", manufacturerRouter);
app.use("/api", userRouter);
app.use("/api/cart", cartItemRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/address", addressRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/seller", sellerRouter);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});
app.use((err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...env.NODE_ENV === "development" && { stack: err.stack }
  });
});
var app_default = app;

// src/server.ts
var port = env.PORT;
var server = app_default.listen(port, () => {
  console.log(` Server running on port ${port}`);
  console.log(` Environment: ${env.NODE_ENV || "development"}`);
  console.log(` Frontend URL: ${env.FRONT_END_URL}`);
});
var shutdown = (signal) => {
  console.log(`
${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log(" Server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error(" Forcing shutdown");
    process.exit(1);
  }, 1e4);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  console.error(" Uncaught Exception:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(" Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
