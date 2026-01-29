import { prisma } from "../../lib/prisma";
import type { CreateCartItemPayload } from "../../types/cartItem";

// =======================
// Add item to cart
// =======================
const createCartItem = async ({
  userId,
  medicineId,
  quantity = 1,
}: CreateCartItemPayload) => {
  //  Check if medicine exists and is active
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine || !medicine.isActive) {
    throw new Error("Medicine not available");
  }

  //  Check stock
  if (medicine.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  //  Check if item already in cart
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_medicineId: {
        userId,
        medicineId,
      },
    },
  });

  if (existingCartItem) {
    //  If exists, increment quantity atomically (safe for concurrent requests)
    return await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  //  If not exists, create new cart item
  return await prisma.cartItem.create({
    data: {
      userId,
      medicineId,
      quantity,
    },
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
    throw new Error("Unauthorized");
  }

  //  Delete cart item safely
  return await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

// =======================
// Update cart item quantity
// =======================
const updateCartItemQuantity = async (
  cartItemId: string,
  userId: string,
  quantity: number,
) => {
  //  Validate minimum quantity
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  //  Fetch cart item with medicine info
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { medicine: true },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  if (cartItem.userId !== userId) {
    throw new Error("Unauthorized");
  }

  //  Check stock before updating
  if (cartItem.medicine.stock < quantity) {
    throw new Error(`Only ${cartItem.medicine.stock} items in stock`);
  }

  //  Update quantity
  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

export const cartItemService = {
  createCartItem,
  getMyCart,
  deleteCartItem,
  updateCartItemQuantity,
};
