import { Router } from "express";
import { userController } from "./auth.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../../generated/prisma/enums";

const router = Router();

router.get("/admin/users", authGuard(ROLE.ADMIN), userController.getAllUsers);

router.get("/auth", authGuard(), userController.getCurrentUser);

router.patch(
  "/admin/users/:id",
  authGuard(ROLE.ADMIN),
  userController.updateUser,
);
// ==============
router.delete(
  "/admin/:userId",
  authGuard(ROLE.ADMIN),
  userController.deleteUserByAdmin,
);
router.delete("/users", authGuard(), userController.deleteMyAccount);

export const userRouter = router;
