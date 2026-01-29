import { Router } from "express";
import { CategoriesController } from "./categories.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../../generated/prisma/enums";
const router = Router();

router.post(
  "/categories",
  authGuard(ROLE.ADMIN, ROLE.SELLER),
  CategoriesController.createCategories,
);

router.get("/categories", CategoriesController.getAllCategory);

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
