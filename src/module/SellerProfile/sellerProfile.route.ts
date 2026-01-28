import { Router } from "express";
import { sellerProfileController } from "./sellerProfile.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/seller-profile",
  authGuard(),
  sellerProfileController.createSellerProfile,
);

router.patch(
  "/seller-profile/:id",
  authGuard(),
  sellerProfileController.updateSellerProfile,
);
router.get(
  "/seller-profile",
  authGuard(),
  sellerProfileController.getCurrentSellerProfile,
);
router.get(
  "/all-sellers",
  authGuard(ROLE.ADMIN),
  sellerProfileController.getAllSellers,
);

export const sellerRouter = router;
