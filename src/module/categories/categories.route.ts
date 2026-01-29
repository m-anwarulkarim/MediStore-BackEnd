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

// Admin: Update category
router.patch(
  "/:id",
  authGuard(ROLE.ADMIN),
  CategoriesController.updateCategory,
);

// Admin: Delete category
router.delete(
  "/:id",
  authGuard(ROLE.ADMIN),
  CategoriesController.deleteCategory,
);

export const categoriesRouter = router;
