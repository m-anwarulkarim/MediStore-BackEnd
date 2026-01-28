import type { Request, Response } from "express";
import { CategoriesService } from "./categories.service";
import { ROLE } from "../../../generated/prisma/enums";

const createCategories = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name must be under 100 characters",
      });
    }

    const data = await CategoriesService.createCategories(name, user.id, slug);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};
// =================================
const getAllCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await CategoriesService.getAllCategory(req.user.id);

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No categories found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error in getAllCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ====================
interface UpdateCategoryBody {
  name?: string;
  slug?: string;
}

const updateCategory = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, slug } = req.body as UpdateCategoryBody;
    const categoryId = req.params.id;

    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    if (!name && !slug) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or slug) is required to update",
      });
    }

    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty",
      });
    }

    // Call service
    const updatedCategory = await CategoriesService.updateCategory(
      categoryId as string,
      name,
      slug,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error("Error in updateCategory controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};
// ============================

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = req.user;

    // Validation
    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const data = await CategoriesService.deleteCategory(
      id as string,
      user.id as string,
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error in deleteCategory controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

export const CategoriesController = {
  createCategories,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
