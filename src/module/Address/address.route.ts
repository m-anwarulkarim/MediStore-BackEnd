import { Router } from "express";
import { addressController } from "./address.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/admin/all",
  authGuard(ROLE.ADMIN),
  addressController.getAllAddresses,
);

router.post("/", authGuard(), addressController.createAddress);

router.get("/my-addresses", authGuard(), addressController.getMyAddresses);

router.get("/:id", authGuard(), addressController.getMyAddressById);

router.put("/:id", authGuard(), addressController.updateAddress);

router.delete("/:id", authGuard(), addressController.deleteAddress);

export const addressRouter = router;
