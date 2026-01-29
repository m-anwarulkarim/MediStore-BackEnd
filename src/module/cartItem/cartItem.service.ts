import { prisma } from "../../lib/prisma";
import type { CreateCartItemPayload } from "../../types/cartItem";

// =======================
// Add item to cart (FIXED - Race condition safe)
// =======================
const createCartItem = async ({
  userId,
  medicineId,
  quantity = 1,
}: CreateCartItemPayload) => {
  // Use transaction to prevent race conditions
  return await prisma.$transaction(async (tx) => {
    // 1. Check if medicine exists and is active
    const medicine = await tx.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine || !medicine.isActive) {
      throw new Error("Medicine not available");
    }

    // 2. Check if item already exists in cart
    const existingCartItem = await tx.cartItem.findUnique({
      where: {
        userId_medicineId: {
          userId,
          medicineId,
        },
      },
    });

    // 3. Calculate total quantity needed
    const totalQuantityNeeded = existingCartItem
      ? existingCartItem.quantity + quantity
      : quantity;

    // 4. Check stock availability BEFORE updating
    if (medicine.stock < totalQuantityNeeded) {
      throw new Error(
        `Insufficient stock. Only ${medicine.stock} items available`,
      );
    }

    // 5. Update or create cart item
    if (existingCartItem) {
      // Update existing cart item
      return await tx.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: {
            increment: quantity,
          },
        },
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              stock: true,
              image: true,
              slug: true,
            },
          },
        },
      });
    }

    // Create new cart item
    return await tx.cartItem.create({
      data: {
        userId,
        medicineId,
        quantity,
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            stock: true,
            image: true,
            slug: true,
          },
        },
      },
    });
  });
};

// =======================
// Get all cart items for a user
// =======================
const getMyCart = async (userId: string) => {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          stock: true,
          image: true,
          slug: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =======================
// Delete a cart item
// =======================
const deleteCartItem = async (cartItemId: string, userId: string) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.userId !== userId) {
    throw new Error("Unauthorized to delete this cart item");
  }

  return await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

// =======================
// Update cart item quantity (FIXED - Better validation)
// =======================
const updateCartItemQuantity = async (
  cartItemId: string,
  userId: string,
  quantity: number,
) => {
  // Validate minimum quantity
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Use transaction for safety
  return await prisma.$transaction(async (tx) => {
    // Fetch cart item with medicine info
    const cartItem = await tx.cartItem.findUnique({
      where: { id: cartItemId },
      include: { medicine: true },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (cartItem.userId !== userId) {
      throw new Error("Unauthorized to update this cart item");
    }

    // Check if medicine is still active
    if (!cartItem.medicine.isActive) {
      throw new Error("Medicine is no longer available");
    }

    // Check stock availability
    if (cartItem.medicine.stock < quantity) {
      throw new Error(
        `Only ${cartItem.medicine.stock} items available in stock`,
      );
    }

    // Update quantity
    return await tx.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            stock: true,
            image: true,
            slug: true,
          },
        },
      },
    });
  });
};

export const cartItemService = {
  createCartItem,
  getMyCart,
  deleteCartItem,
  updateCartItemQuantity,
};
