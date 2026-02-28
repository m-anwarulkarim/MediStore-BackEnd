import { Router } from "express";
import { jwtController } from "./jwt.controller";

const router = Router();

router.post("/login", jwtController.login);
router.post("/refresh", jwtController.refresh);
router.post("/logout", jwtController.logout);
router.post("/from-session", jwtController.fromSession);

export const jwtRouter = router;