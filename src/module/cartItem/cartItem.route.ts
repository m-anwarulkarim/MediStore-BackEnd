import { Router } from "express";
import { cartController } from "./cartItem.controller";
import authGuard from "../../guard/auth.guard";

const router = Router();

router.post("/", authGuard(), cartController.createCartItem);
router.get("/", authGuard(), cartController.getMyCart);
router.delete("/:cartItemId", authGuard(), cartController.deleteCartItem);
router.put("/:cartItemId", authGuard(), cartController.updateCartItemQuantity);

export const cartItemRouter = router;
