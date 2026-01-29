import type { Request, Response } from "express";
import { medicineService } from "./medicine.service";
import { ROLE } from "../../generated/prisma/enums";
import type {
  CreateMedicinePayload,
  UpdateMedicinePayload,
} from "../../types/Medicine";

// Create medicine
const createMedicine = async (
  req: Request<{}, {}, CreateMedicinePayload>,
  res: Response,
) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (user.role !== ROLE.SELLER)
      return res
        .status(403)
        .json({ success: false, message: "Only sellers can add medicines" });

    const data = await medicineService.createMedicine({
      ...req.body,
      userId: user.id,
    });
    return res
      .status(201)
      .json({ success: true, message: "Medicine created successfully", data });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create medicine",
    });
  }
};

// Get all medicines
const getAllMedicine = async (req: Request, res: Response) => {
  try {
    const {
      id,
      slug,
      categoryId,
      sellerId,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    } = req.query;

    const data = await medicineService.getAllMedicine({
      id: id as string,
      slug: slug as string,
      categoryId: categoryId as string,
      sellerId: sellerId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      sortBy: (sortBy as string) || "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    });

    return res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      ...data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch medicines",
    });
  }
};

// Update medicine
const updateMedicine = async (
  req: Request<{ medicineId: string }, {}, UpdateMedicinePayload>,
  res: Response,
) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (user.role !== ROLE.SELLER)
      return res
        .status(403)
        .json({ success: false, message: "Only sellers can update medicines" });

    const updatedMedicine = await medicineService.updateMedicine({
      medicineId: req.params.medicineId,
      sellerId: user.id,
      ...req.body,
    });
    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update medicine",
    });
  }
};

// Delete medicine
const deleteMedicine = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (user.role !== ROLE.SELLER)
      return res
        .status(403)
        .json({ success: false, message: "Only sellers can delete medicines" });

    const result = await medicineService.removeMedicine({
      medicineId: req.params.medicineId as string,
      sellerId: user.id,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete medicine",
    });
  }
};

// Get single medicine details
const getMedicineDetails = async (req: Request, res: Response) => {
  try {
    const { medicineId } = req.params;
    const reviewPage = req.query.reviewPage
      ? parseInt(req.query.reviewPage as string)
      : 1;
    const reviewLimit = req.query.reviewLimit
      ? parseInt(req.query.reviewLimit as string)
      : 5;

    const data = await medicineService.getMedicineDetails(
      medicineId as string,
      reviewPage,
      reviewLimit,
    );
    return res.status(200).json({
      success: true,
      message: "Medicine details fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch medicine details",
    });
  }
};

export const medicineController = {
  createMedicine,
  getAllMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineDetails,
};
