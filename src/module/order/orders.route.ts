import { Router } from "express";
import { orderController } from "./orders.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import JwtGuard from "../../guard/jwt.guard";

const router = Router();

// Admin: Get all orders
router.get(
  "/admin/all",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  orderController.getAllOrdersForAdmin,
);

// Seller: Get orders for their medicines
router.get(
  "/seller/all",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  orderController.getSellerOrders,
);

// Customer: Create order from cart
router.post(
  "/",
  authGuard(ROLE.CUSTOMER),
  JwtGuard(),
  orderController.createOrder,
);

// Customer: Get my orders
router.get(
  "/my-orders",
  authGuard(ROLE.CUSTOMER),
  JwtGuard(),
  orderController.getUserOrders,
);

// Customer/Seller/Admin: Get single order details
router.get(
  "/:orderId",
  authGuard(ROLE.CUSTOMER, ROLE.SELLER, ROLE.ADMIN),
  JwtGuard(),
  orderController.getOrderDetails,
);

// Seller/Admin: Update order status
router.patch(
  "/:orderId/status",
  authGuard(ROLE.SELLER, ROLE.ADMIN),
  JwtGuard(),
  orderController.updateOrderStatus,
);

export const OrderRouter = router;
