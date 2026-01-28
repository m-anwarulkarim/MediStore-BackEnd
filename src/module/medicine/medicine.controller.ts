import type { Request, Response } from "express";
import { medicineService } from "./medicine.service";

const createMedicine = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, slug, description, manufacturer, price, categoryId } = req.body;

  try {
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "Your are not authorized , A seller Can Add medicines",
      });
    }
    if (!slug || !description || !manufacturer || !price || !categoryId) {
      res.status(400).json({
        success: false,
        message:
          "slug, description, manufacturer, price  are Requerd, please add it ",
      });
    }
    const data = await medicineService.createMedicine(
      name,
      description,
      manufacturer,
      price,
      userId!,
      categoryId,
    );

    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      Message: "",
    });
  }
};

export const medicinController = {
  createMedicine,
};
