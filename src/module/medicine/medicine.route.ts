import { Router } from "express";
import { medicineController } from "./medicine.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import JwtGuard from "../../guard/jwt.guard";

const router = Router();

// Public: Get all medicines (with filters, search, pagination)
router.get("/", medicineController.getAllMedicine);

router.get(
  "/seller/my",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  medicineController.getMyMedicines,
);

// Public: Get single medicine details
router.get("/:medicineId", JwtGuard(), medicineController.getMedicineDetails);

// Seller: Create new medicine
router.post(
  "/",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  medicineController.createMedicine,
);

// Seller: Update own medicine
router.put(
  "/:medicineId",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  medicineController.updateMedicine,
);

// Seller: Delete own medicine
router.delete(
  "/:medicineId",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  medicineController.deleteMedicine,
);

router.patch(
  "/:medicineId/stock",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  medicineController.updateStock,
);

export const medicineRouter = router;
