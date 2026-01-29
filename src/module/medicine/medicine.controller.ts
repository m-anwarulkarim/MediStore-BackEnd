import type { Request, Response } from "express";
import { medicineService } from "./medicine.service";
import type {
  CreateMedicinePayload,
  UpdateMedicinePayload,
} from "../../types/Medicine";
import { ROLE } from "../../generated/prisma/enums";

// ==========================
// 1. Create medicine
// ==========================
const createMedicine = async (
  req: Request<{}, {}, CreateMedicinePayload>,
  res: Response,
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can add medicines",
      });
    }

    const { name, description, manufacturer, price, categoryId } = req.body;

    // Validation
    if (!name || !description || !manufacturer || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: name, description, manufacturer, price, categoryId",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    const data = await medicineService.createMedicine({
      ...req.body,
      userId: user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      data,
    });
  } catch (error: any) {
    console.error("Create medicine error:", error);

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("not found") ||
      error.message.includes("Invalid")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create medicine",
    });
  }
};

// ==========================
// 2. Get all medicines (with filters)
// ==========================
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
    console.error("Get medicines error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
    });
  }
};

// ==========================
// 3. Get single medicine details
// ==========================
const getMedicineDetails = async (req: Request, res: Response) => {
  try {
    const { medicineId } = req.params;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

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
    console.error("Get medicine details error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine details",
    });
  }
};

// ==========================
// 4. Update medicine
// ==========================
const updateMedicine = async (
  req: Request<{ medicineId: string }, {}, UpdateMedicinePayload>,
  res: Response,
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update medicines",
      });
    }

    const { medicineId } = req.params;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    // Validate price if provided
    if (req.body.price !== undefined && req.body.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    const updatedMedicine = await medicineService.updateMedicine({
      medicineId,
      sellerId: user.id,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine,
    });
  } catch (error: any) {
    console.error("Update medicine error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("already exists")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update medicine",
    });
  }
};

// ==========================
// 5. Delete medicine
// ==========================
const deleteMedicine = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can delete medicines",
      });
    }

    const { medicineId } = req.params as any;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const result = await medicineService.removeMedicine({
      medicineId,
      sellerId: user.id,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Delete medicine error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete medicine",
    });
  }
};

export const medicineController = {
  createMedicine,
  getAllMedicine,
  getMedicineDetails,
  updateMedicine,
  deleteMedicine,
};
