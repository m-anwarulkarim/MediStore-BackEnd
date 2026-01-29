import { Router } from "express";
import { addressController } from "./address.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Admin: Get all addresses
router.get(
  "/admin/all",
  authGuard(ROLE.ADMIN),
  addressController.getAllAddresses,
);

// Customer/Seller: Create address
router.post("/", authGuard(), addressController.createAddress);

// Customer/Seller: Get my addresses
router.get("/my-addresses", authGuard(), addressController.getMyAddresses);

// Customer/Seller: Get single address
router.get("/:id", authGuard(), addressController.getMyAddressById);

// Customer/Seller: Update address
router.put("/:id", authGuard(), addressController.updateAddress);

// Customer/Seller: Delete address
router.delete("/:id", authGuard(), addressController.deleteAddress);

export const addressRouter = router;
