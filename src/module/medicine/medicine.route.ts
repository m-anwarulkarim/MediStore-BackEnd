import { Router } from "express";
import { medicineController } from "./medicine.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Public: Get all medicines (with filters, search, pagination)
router.get("/", medicineController.getAllMedicine);

// Public: Get single medicine details
router.get("/:medicineId", medicineController.getMedicineDetails);

// Seller: Create new medicine
router.post("/", authGuard(ROLE.SELLER), medicineController.createMedicine);

// Seller: Update own medicine
router.put(
  "/:medicineId",
  authGuard(ROLE.SELLER),
  medicineController.updateMedicine,
);

// Seller: Delete own medicine
router.delete(
  "/:medicineId",
  authGuard(ROLE.SELLER),
  medicineController.deleteMedicine,
);

router.patch(
  "/:medicineId/stock",
  authGuard(ROLE.SELLER),
  medicineController.updateStock,
);

export const medicineRouter = router;
