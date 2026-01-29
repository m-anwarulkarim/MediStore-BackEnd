import type { Request, Response } from "express";
import { CategoriesService } from "./categories.service";
import { ROLE } from "../../generated/prisma/enums";

// ==========================
// 1. Create category
// ==========================
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

    if (user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only admins and sellers can create categories",
      });
    }

    if (!name || name.trim().length === 0) {
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

    const data = await CategoriesService.createCategories(
      name.trim(),
      user.id,
      slug,
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data,
    });
  } catch (error: any) {
    console.error("Create category error:", error);

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// ==========================
// 2. Get all categories
// ==========================
const getAllCategory = async (req: Request, res: Response) => {
  try {
    const data = await CategoriesService.getAllCategory();

    return res.status(200).json({
      success: true,
      message:
        data.length === 0
          ? "No categories found"
          : "Categories retrieved successfully",
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

// ==========================
// 3. Update category
// ==========================
const updateCategory = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, slug } = req.body;
    const categoryId = req.params.id;

    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
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
        message: "At least one field (name or slug) is required",
      });
    }

    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty",
      });
    }

    if (name && name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name must be under 100 characters",
      });
    }

    const updatedCategory = await CategoriesService.updateCategory(
      categoryId as string,
      name?.trim(),
      slug,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error("Error in updateCategory controller:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// ==========================
// 4. Delete category
// ==========================
const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = req.user;

    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const data = await CategoriesService.deleteCategory(id as string, user.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error in deleteCategory controller:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("unauthorized")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Cannot delete")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

export const CategoriesController = {
  createCategories,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
