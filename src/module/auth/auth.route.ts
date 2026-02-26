import { Router } from "express";
import { userController } from "./auth.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import JwtGuard from "../../guard/jwt.guard";

const router = Router();

// Admin: Get all users
router.get(
  "/admin/users",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  userController.getAllUsers,
);

// Current user info
router.get("/auth", authGuard(), JwtGuard(), userController.getCurrentUser);

// Admin: Update user status
router.patch(
  "/admin/users/:id",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  userController.updateUser,
);

// Admin: Delete user
router.delete(
  "/admin/users/:userId",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  userController.deleteUserByAdmin,
);

// Customer/Seller: Delete own account
router.delete(
  "/users/me",
  authGuard(),
  JwtGuard(),
  userController.deleteMyAccount,
);

router.patch(
  "/admin/users/:id/role",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  userController.updateUserRole,
);
router.get(
  "/users/me/profile",
  authGuard(),
  JwtGuard(),
  userController.getMyProfile,
);
router.patch(
  "/users/me/profile",
  authGuard(),
  JwtGuard(),
  userController.updateMyProfile,
);
// Logout current user
router.post(
  "/users/logout",
  authGuard(),
  JwtGuard(),
  userController.logoutUser,
);

export const userRouter = router;
