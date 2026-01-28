import { Router } from "express";
import { medicinController } from "./medicine.controller";
import authGuard from "../../guard/auth.guard";

const router = Router();
router.post("/medicines", authGuard(), medicinController.createMedicine);

export const medicineRouter = router;
