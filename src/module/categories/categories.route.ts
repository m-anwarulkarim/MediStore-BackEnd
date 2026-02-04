import { Router } from "express";
import { CategoriesController } from "./categories.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Admin/Seller: Create category
router.post(
  "/",
  authGuard(ROLE.ADMIN, ROLE.SELLER),
  CategoriesController.createCategories,
);

// Public: Get all categories
router.get("/", CategoriesController.getAllCategory);

// Admin/Seller: Update category
router.patch(
  "/:id",
  authGuard(ROLE.ADMIN, ROLE.SELLER),
  CategoriesController.updateCategory,
);

// Admin/seller: Delete category
router.delete(
  "/:id",
  authGuard(ROLE.ADMIN, ROLE.SELLER),
  CategoriesController.deleteCategory,
);

// Admin/Seller: Update category
router.patch(
  "/:id",
  authGuard(ROLE.ADMIN, ROLE.SELLER),
  CategoriesController.getSingleCategory,
);
export const categoriesRouter = router;
