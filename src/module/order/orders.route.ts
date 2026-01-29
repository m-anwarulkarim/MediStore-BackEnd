import { Router } from "express";
import { orderController } from "./orders.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Admin: Get all orders
router.get(
  "/admin/all",
  authGuard(ROLE.ADMIN),
  orderController.getAllOrdersForAdmin,
);

// Seller: Get orders for their medicines
router.get(
  "/seller/all",
  authGuard(ROLE.SELLER),
  orderController.getSellerOrders,
);

// Customer: Create order from cart
router.post("/", authGuard(ROLE.CUSTOMER), orderController.createOrder);

// Customer: Get my orders
router.get(
  "/my-orders",
  authGuard(ROLE.CUSTOMER),
  orderController.getUserOrders,
);

// Customer/Seller/Admin: Get single order details
router.get(
  "/:orderId",
  authGuard(ROLE.CUSTOMER, ROLE.SELLER, ROLE.ADMIN),
  orderController.getOrderDetails,
);

// Seller/Admin: Update order status
router.patch(
  "/:orderId/status",
  authGuard(ROLE.SELLER, ROLE.ADMIN),
  orderController.updateOrderStatus,
);

export const OrderRouter = router;
