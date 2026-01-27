import { Router } from "express";
import { userController } from "./auth.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/user",
  authGuard(ROLE.ADMIN, ROLE.SELLER, ROLE.CUSTOMER),
  userController.viewAllUsers,
);
router.get("/user/:id", userController.viewSingleUser);

export const userRouter = { router };
