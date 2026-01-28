import { Router } from "express";
import { OrderController } from "./orders.controller";

const router = Router();
router.post("/orders", OrderController.createOrder);

export const OrderRouter = router;
