import { Router } from "express";
import { cartItemController } from "./cartItem.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";

const router = Router();

// Customer: Add to cart
router.post("/", authGuard(ROLE.CUSTOMER), cartItemController.createCartItem);

// Customer: Get my cart
router.get("/", authGuard(ROLE.CUSTOMER), cartItemController.getMyCart);

// Customer: Update cart item quantity
router.put(
  "/:cartItemId",
  authGuard(ROLE.CUSTOMER),
  cartItemController.updateCartItemQuantity,
);

// Customer: Delete cart item
router.delete(
  "/:cartItemId",
  authGuard(ROLE.CUSTOMER),
  cartItemController.deleteCartItem,
);

export const cartItemRouter = router;
