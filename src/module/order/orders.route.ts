import { Router } from "express";
import { orderController } from "./orders.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// 1. Create a new order from cart (Customer only)

router.post("/", authGuard(ROLE.CUSTOMER), orderController.createOrder);

// 2. Get current user's orders (Customer only)

router.get("/", authGuard(ROLE.CUSTOMER), orderController.getUserOrders);

// 3. Get single order details (Customer, Seller, Admin)

router.get(
  "/:orderId",
  authGuard(ROLE.CUSTOMER, ROLE.SELLER, ROLE.ADMIN),
  orderController.getOrderDetails,
);

// 4. Seller: get orders for their medicines

router.get(
  "/seller/orders",
  authGuard(ROLE.SELLER),
  orderController.getSellerOrders,
);

// 5. Update order status (Seller or Admin)

router.patch(
  "/status/:orderId",
  authGuard(ROLE.SELLER, ROLE.ADMIN),
  orderController.updateOrderStatus,
);

// 6. Admin: get all orders

router.get(
  "/admin/all",
  authGuard(ROLE.ADMIN),
  orderController.getAllOrdersForAdmin,
);

export const OrderRouter = router;
