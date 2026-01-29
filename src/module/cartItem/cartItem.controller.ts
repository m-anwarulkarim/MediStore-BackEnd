import type { Request, Response } from "express";
import { cartItemService } from "./cartItem.service";

// =====================
// Add a new item to the cart
// =====================
const createCartItem = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { medicineId, quantity } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //  Call service to create cart item (includes stock check + merge quantity)
    const cartItem = await cartItemService.createCartItem({
      userId: user.id,
      medicineId,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Added to cart",
      data: cartItem,
    });
  } catch (error: any) {
    //  Catch service errors (e.g., stock issues) and return 400
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// Get all cart items for the current user
// =====================
const getMyCart = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //  Fetch cart items with medicine info
    const cartItems = await cartItemService.getMyCart(user.id);

    res.status(200).json({
      success: true,
      data: cartItems,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// Delete a cart item
// =====================
const deleteCartItem = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //  Call service to delete (includes ownership check)
    await cartItemService.deleteCartItem(cartItemId as string, user.id);

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// Update cart item quantity
// =====================
const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //  Call service to update quantity (includes stock + min quantity checks)
    const updatedCartItem = await cartItemService.updateCartItemQuantity(
      cartItemId as string,
      user.id,
      quantity,
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCartItem,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cartController = {
  createCartItem,
  getMyCart,
  deleteCartItem,
  updateCartItemQuantity,
};
