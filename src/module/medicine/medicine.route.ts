import { Router } from "express";
import { medicineController } from "./medicine.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// ==============================
// Seller: Create new medicine
// ==============================
router.post(
  "/medicines",
  authGuard(ROLE.SELLER),
  medicineController.createMedicine,
);

// ==============================
// Public: Get medicines with filters
// ==============================
router.get("/medicines", medicineController.getAllMedicine);

// ==============================
// Seller: Update own medicine
// ==============================
router.put(
  "/medicines/:medicineId",
  authGuard(ROLE.SELLER),
  medicineController.updateMedicine,
);

// ==============================
// Seller: Delete  medicine
// ============================
router.delete(
  "/medicines/:medicineId",
  authGuard(ROLE.SELLER),
  medicineController.deleteMedicine,
);
// ==============================
// Service:  Get single medicine details
// ==============================
router.get("/medicines/:medicineId", medicineController.getMedicineDetails);

export const medicineRouter = router;
