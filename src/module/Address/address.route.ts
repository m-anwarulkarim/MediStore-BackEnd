import { Router } from "express";
import { addressController } from "./address.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import JwtGuard from "../../guard/jwt.guard";

const router = Router();

// Admin: Get all addresses
router.get(
  "/admin/all",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  addressController.getAllAddresses,
);

// Customer/Seller: Create address
router.post("/", authGuard(), JwtGuard(), addressController.createAddress);

// Customer/Seller: Get my addresses
router.get("/my-addresses", authGuard(), JwtGuard(), addressController.getMyAddresses);

// Customer/Seller: Get single address
router.get("/:id", authGuard(), JwtGuard(), addressController.getMyAddressById);

// Customer/Seller: Update address
router.put("/:id", authGuard(), JwtGuard(), addressController.updateAddress);

// Customer/Seller: Delete address
router.delete("/:id", authGuard(), JwtGuard(), addressController.deleteAddress);

export const addressRouter = router;
