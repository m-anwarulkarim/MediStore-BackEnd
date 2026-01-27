import { Router } from "express";
import { medicinController } from "./medicine.controller";

const router = Router();
router.post("/", medicinController.createMedicine);

export const medicineRouter = router;
