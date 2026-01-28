import { Router } from "express";
import { CategoriesController } from "./categories.controller";
import authGuard from "../../guard/auth.guard";
const router = Router();
router.post("/categories", authGuard(), CategoriesController.createCategories);
router.get("/categories", authGuard(), CategoriesController.getAllCategory);
router.patch(
  "/categories/:id",
  authGuard(),
  CategoriesController.updateCategory,
);
router.delete(
  "/categories/:id",
  authGuard(),
  CategoriesController.deleteCategory,
);

export const categoriesRouter = router;
