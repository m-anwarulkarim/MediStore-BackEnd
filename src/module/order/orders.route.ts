import { Router } from "express";
import { orderController } from "./orders.controller";

const router = Router();

// Create a new order from cart
router.post("/", orderController.createOrder);

// Get single order details (by orderId)
router.get("/:orderId", orderController.getOrderDetails);

// Get current user's orders
router.get("/", orderController.getUserOrders);

// Seller: get orders for their medicines
router.get("/seller", orderController.getSellerOrders);

// Update order status ( Seller)
router.patch("/status/:orderId", orderController.updateOrderStatus);

export const OrderRouter = router;
