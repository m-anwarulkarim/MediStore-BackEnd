import type { Request, Response } from "express";
import { medicineService } from "./medicine.service";

const createMedicine = async (req: Request, res: Response) => {
  const data = await medicineService.createMedicine();
};

export const medicinController = {
  createMedicine,
};
