import { Router } from "express";
import { userController } from "./auth.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Admin: Get all users
router.get("/admin/users", authGuard(ROLE.ADMIN), userController.getAllUsers);

// Current user info
router.get("/auth", authGuard(), userController.getCurrentUser);

// Admin: Update user status
router.patch(
  "/admin/users/:id",
  authGuard(ROLE.ADMIN),
  userController.updateUser,
);

// Admin: Delete user
router.delete(
  "/admin/users/:userId",
  authGuard(ROLE.ADMIN),
  userController.deleteUserByAdmin,
);

// Customer/Seller: Delete own account
router.delete("/users/me", authGuard(), userController.deleteMyAccount);

router.patch(
  "/admin/users/:id/role",
  authGuard(ROLE.ADMIN),
  userController.updateUserRole,
);

export const userRouter = router;
