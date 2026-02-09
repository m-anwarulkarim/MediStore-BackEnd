import type { Request, Response } from "express";
import { CategoriesService } from "./categories.service";
import { ROLE } from "../../generated/prisma/enums";

// ==========================
// 1. Create category
// ==========================
const createCategories = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image } = req.body;
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

    const data = await CategoriesService.createCategories(
      name.trim(),
      user.id,
      slug,
      image,
      description,
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data,
    });
  } catch (error: any) {
    console.error("Create category error:", error);
    return res
      .status(error.message.includes("already exists") ? 409 : 500)
      .json({
        success: false,
        message: error.message || "Failed to create category",
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// ==========================
// 3. Update category
// ==========================
const updateCategory = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { name, slug, image, description } = req.body;
    const categoryId = req.params.id;

    if (!user || (user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updatedCategory = await CategoriesService.updateCategory(
      categoryId as string,
      {
        name: name?.trim(),
        slug,
        image,
        description,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error("Update controller error:", error);
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("exists")
        ? 409
        : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to update category",
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

    if (!user || (user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin or Seller access required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const data = await CategoriesService.deleteCategory(id as string);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error in deleteCategory controller:", error);

    let statusCode = 500;
    if (error.message.includes("not found")) statusCode = 404;
    if (error.message.includes("linked medicines")) statusCode = 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "An error occurred while deleting the category",
    });
  }
};

// ==========================
// 5. Get Single category
// ==========================
const getSingleCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;

    const category = await CategoriesService.getSingleCategory(
      categoryId as string,
    );

    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: { category },
    });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch category details",
    });
  }
};

export const CategoriesController = {
  createCategories,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory,
};
