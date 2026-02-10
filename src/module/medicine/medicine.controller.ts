import type { Request, Response } from "express";
import { medicineService } from "./medicine.service";
import type {
  CreateMedicinePayload,
  UpdateMedicinePayload,
  UpdateStockPayload,
} from "../../types/Medicine";
import { ROLE } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

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
      manufacturer,
      minPrice,
      maxPrice,
    } = req.query;

    const { isActive } = req.query;
    const parsedIsActive =
      isActive === "true" ? true : isActive === "false" ? false : undefined;

    //  price parse (string -> number)
    const parsedMinPrice =
      minPrice != null && minPrice !== "" ? Number(minPrice) : undefined;

    const parsedMaxPrice =
      maxPrice != null && maxPrice !== "" ? Number(maxPrice) : undefined;

    const data = await medicineService.getAllMedicine({
      id: id as string,
      slug: slug as string,
      categoryId: categoryId as string,
      sellerId: sellerId as string,

      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,

      search: search as string,

      manufacturer: manufacturer as string,
      minPrice: Number.isFinite(parsedMinPrice as number)
        ? parsedMinPrice
        : undefined,
      maxPrice: Number.isFinite(parsedMaxPrice as number)
        ? parsedMaxPrice
        : undefined,

      sortBy: (sortBy as string) || "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      isActive: parsedIsActive,
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

const getMyMedicines = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!sellerProfile)
      return res
        .status(404)
        .json({ success: false, message: "Seller profile not found" });

    const { categoryId, page, limit, search, sortBy, sortOrder, isActive } =
      req.query;

    const parsedIsActive =
      isActive === "true" ? true : isActive === "false" ? false : undefined;

    const data = await medicineService.getAllMedicine({
      sellerId: sellerProfile.id,
      categoryId: categoryId as string,
      isActive: parsedIsActive,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      search: search as string,
      sortBy: (sortBy as string) || "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    });

    return res.status(200).json({
      success: true,
      message: "Seller medicines fetched successfully",
      ...data,
    });
  } catch (e: any) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch seller medicines" });
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
      return res.status(401).json({ success: false, message: "Unauthorized" });
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

    //  Validate price if provided
    if (req.body.price !== undefined && req.body.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    //  Validate stock if provided
    if (req.body.stock !== undefined && req.body.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    //   user.id -> sellerProfile.id
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      });
    }

    const updatedMedicine = await medicineService.updateMedicine({
      medicineId,
      sellerId: sellerProfile.id, //  FIXED
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updatedMedicine,
    });
  } catch (error: any) {
    console.error("Update medicine error:", error);

    if (error.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("already exists") ||
      error.message?.includes("Invalid")
    ) {
      return res.status(400).json({ success: false, message: error.message });
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
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can delete medicines",
      });
    }

    //  normalize medicineId (TS + runtime safe)
    const rawMedicineId = req.params.medicineId;
    const medicineId = Array.isArray(rawMedicineId)
      ? rawMedicineId[0]
      : rawMedicineId;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    //  get sellerProfile.id (IMPORTANT)
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      });
    }

    const result = await medicineService.removeMedicine({
      medicineId,
      sellerId: sellerProfile.id,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Delete medicine error:", error);

    if (error.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.message?.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete medicine",
    });
  }
};
//  PATCH /api/medicines/:medicineId/stock
const updateStock = async (
  req: Request<{ medicineId: string }, {}, UpdateStockPayload>,
  res: Response,
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (user.role !== ROLE.SELLER) {
      return res
        .status(403)
        .json({ success: false, message: "Only sellers can update stock" });
    }

    const { medicineId } = req.params;
    const { stock } = req.body;

    if (!medicineId) {
      return res
        .status(400)
        .json({ success: false, message: "Medicine ID is required" });
    }

    if (typeof stock !== "number" || Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!sellerProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller profile not found" });
    }

    const updated = await medicineService.updateStock({
      medicineId,
      sellerId: sellerProfile.id,
      stock,
    });

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: updated,
    });
  } catch (error: any) {
    // friendly error mapping
    if (error.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message?.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }

    return res
      .status(500)
      .json({ success: false, message: "Failed to update stock" });
  }
};

export const medicineController = {
  createMedicine,
  getAllMedicine,
  getMedicineDetails,
  updateMedicine,
  deleteMedicine,
  updateStock,
  getMyMedicines,
};
