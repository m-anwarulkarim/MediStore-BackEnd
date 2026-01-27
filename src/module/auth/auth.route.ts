import { Router } from "express";
import { userController } from "./auth.controller";

const router = Router();

// Example route
router.get("/user", userController.createUser);

export const userRouter = { router };
