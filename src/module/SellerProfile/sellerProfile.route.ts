import { Router } from "express";
import { sellerProfileController } from "./sellerProfile.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Admin: Get all sellers
router.get(
  "/all",
  authGuard(ROLE.ADMIN),
  sellerProfileController.getAllSellers,
);

// Seller: Create seller profile
router.post(
  "/profile",
  authGuard(ROLE.SELLER),
  sellerProfileController.createSellerProfile,
);

// Seller: Get own profile
router.get(
  "/profile",
  authGuard(ROLE.SELLER),
  sellerProfileController.getCurrentSellerProfile,
);

// Seller: Update own profile
router.put(
  "/profile",
  authGuard(ROLE.SELLER),
  sellerProfileController.updateSellerProfile,
);

export const sellerRouter = router;
