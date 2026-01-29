import type { Request, Response } from "express";
import { cartItemService } from "./cartItem.service";

// ==========================
// 1. Add item to cart
// ==========================
const createCartItem = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { medicineId, quantity } = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validation
    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    if (quantity && (quantity < 1 || quantity > 100)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 100",
      });
    }

    const cartItem = await cartItemService.createCartItem({
      userId: user.id,
      medicineId,
      quantity: quantity || 1,
    });

    return res.status(201).json({
      success: true,
      message: "Added to cart successfully",
      data: cartItem,
    });
  } catch (error: any) {
    console.error("Add to cart error:", error);

    if (
      error.message.includes("not available") ||
      error.message.includes("stock")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

// ==========================
// 2. Get my cart
// ==========================
const getMyCart = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cartItems = await cartItemService.getMyCart(user.id);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cartItems,
    });
  } catch (error: any) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// ==========================
// 3. Delete cart item
// ==========================
const deleteCartItem = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    await cartItemService.deleteCartItem(cartItemId as string, user.id);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error: any) {
    console.error("Delete cart item error:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("Unauthorized")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

// ==========================
// 4. Update cart item quantity
// ==========================
const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    if (quantity > 100) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot exceed 100",
      });
    }

    const updatedCartItem = await cartItemService.updateCartItemQuantity(
      cartItemId as string,
      user.id,
      quantity,
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCartItem,
    });
  } catch (error: any) {
    console.error("Update cart quantity error:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("Unauthorized")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("stock")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

export const cartItemController = {
  createCartItem,
  getMyCart,
  deleteCartItem,
  updateCartItemQuantity,
};
