import { Router } from "express";
import { sellerProfileController } from "./sellerProfile.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import JwtGuard from "../../guard/jwt.guard";

const router = Router();

// Admin: Get all sellers
router.get(
  "/all",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  sellerProfileController.getAllSellers,
);

// Seller: Create seller profile
router.post(
  "/profile",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  sellerProfileController.createSellerProfile,
);

// Seller: Get own profile
router.get(
  "/profile",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  sellerProfileController.getCurrentSellerProfile,
);

// Seller: Update own profile
router.put(
  "/profile",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  sellerProfileController.updateSellerProfile,
);

export const sellerRouter = router;
