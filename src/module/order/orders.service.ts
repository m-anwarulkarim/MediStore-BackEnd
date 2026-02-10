import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  ROLE,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type {
  CreateOrderPayload,
  UpdateOrderStatusPayload,
} from "../../types/order";
import type { USER_ROLE } from "../../types/userRole";
import VALID_TRANSITIONS from "../../types/VALID_TRANSITIONS";
import { generateOrderNumber } from "../../ui/generateOrderNumber";

// =======================
// Create order from cart
// =======================
const createOrderFromCart = async ({
  userId,
  addressId,
  customerNote,
}: CreateOrderPayload) => {
  return await prisma.$transaction(async (tx) => {
    // Fetch cart items
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { medicine: true },
    });

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    let subtotal = 0;

    // Validate each item
    for (const item of cartItems) {
      if (!item.medicine.isActive) {
        throw new Error(`${item.medicine.name} is not available`);
      }

      if (item.medicine.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.medicine.name}. Only ${item.medicine.stock} available`,
        );
      }

      const price = item.medicine.discountPrice ?? item.medicine.price;
      subtotal += Number(price) * item.quantity;
    }

    const deliveryCharge = 0;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber: generateOrderNumber(),
        subtotal,
        deliveryCharge,
        discount,
        total,
        customerNote,
        status: ORDER_STATUS.PLACED,
        paymentMethod: PAYMENT_METHOD.CASH_ON_DELIVERY,
        orderItems: {
          create: cartItems.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.medicine.discountPrice ?? item.medicine.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                image: true,
                slug: true,
              },
            },
          },
        },
        address: true,
      },
    });

    // Deduct stock
    await Promise.all(
      cartItems.map((item) =>
        tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    // Clear cart
    const cartItemIds = cartItems.map((item) => item.id);
    await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });

    return order;
  });
};

// =======================
// Get single order details
// =======================
const getOrderDetails = async (
  orderId: string,
  userId: string,
  role: USER_ROLE,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              image: true,
              slug: true,
              sellerId: true,
            },
          },
        },
      },
      address: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Authorization check
  if (role === ROLE.CUSTOMER && order.userId !== userId) {
    throw new Error("Unauthorized to view this order");
  }

  // Seller can only see orders containing their medicines
  if (role === ROLE.SELLER) {
    const hasSellerItem = order.orderItems.some(
      (item) => item.medicine.sellerId === userId,
    );
    if (!hasSellerItem) {
      throw new Error("Unauthorized to view this order");
    }
  }

  return order;
};

// =======================
// Get all orders of a user
// =======================
const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              image: true,
              slug: true,
            },
          },
        },
      },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// =======================
// Get seller orders
// =======================
const getSellerOrders = async (sellerProfileId: string) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { medicine: { sellerId: sellerProfileId } },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true,
        },
      },
      medicine: {
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          slug: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped: Record<string, any> = {};

  for (const item of orderItems) {
    const orderId = item.orderId;

    if (!grouped[orderId]) {
      grouped[orderId] = {
        ...item.order,
        orderItems: [],
      };
    }

    grouped[orderId].orderItems.push(item);
  }

  const result = Object.values(grouped);

  //  sort by order createdAt (latest orders first)
  result.sort((a: any, b: any) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return db - da;
  });

  return result;
};

// =======================
// Update Order Status (FIXED - With State Machine Validation)
// =======================
const updateOrderStatus = async ({
  orderId,
  status,
  userRole,
  userId,
}: UpdateOrderStatusPayload) => {
  return await prisma.$transaction(async (tx) => {
    // Fetch order with items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // ========== VALIDATION 1: Check if transition is valid ==========
    const allowedTransitions = VALID_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(status)) {
      throw new Error(
        `Cannot change order status from ${order.status} to ${status}`,
      );
    }

    // ========== VALIDATION 2: Role-based permissions ==========

    // CUSTOMER rules
    if (userRole === ROLE.CUSTOMER) {
      // Customer can only cancel their own orders
      if (order.userId !== userId) {
        throw new Error("Unauthorized to update this order");
      }

      // Customer can only cancel orders in PLACED status
      if (status !== ORDER_STATUS.CANCELLED) {
        throw new Error("Customers can only cancel orders");
      }

      if (order.status !== ORDER_STATUS.PLACED) {
        throw new Error("Can only cancel orders that are in PLACED status");
      }
    }

    if (userRole === ROLE.SELLER) {
      //  userId এখানে sellerProfile.id হওয়া লাগবে
      const sellerItem = await tx.orderItem.findFirst({
        where: {
          orderId,
          medicine: { sellerId: userId },
        },
        select: { id: true },
      });

      if (!sellerItem) {
        throw new Error("Unauthorized to update this order");
      }

      if (status === ORDER_STATUS.CANCELLED) {
        throw new Error("Sellers cannot cancel orders");
      }

      const allowedSellerStatuses = [
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PROCESSING,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.DELIVERED,
      ];

      if (!allowedSellerStatuses.includes(status)) {
        throw new Error(`Invalid status update for seller: ${status}`);
      }
    }

    // ADMIN can update to any valid transition (already checked above)

    // ========== STOCK ROLLBACK on cancellation ==========
    if (status === ORDER_STATUS.CANCELLED) {
      await Promise.all(
        order.orderItems.map((item) =>
          tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );
    }

    // ========== SET deliveredAt timestamp ==========
    const deliveredAt =
      status === ORDER_STATUS.DELIVERED ? new Date() : order.deliveredAt;

    // ========== UPDATE ORDER ==========
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        deliveredAt,
        // Set cancelReason if needed (you can add this to payload)
        ...(status === ORDER_STATUS.CANCELLED && {
          cancelReason: "Cancelled by user",
        }),
      },
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        address: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return updatedOrder;
  });
};

// =======================
// Admin: Get all orders
// =======================
const getAllOrdersForAdmin = async () => {
  return await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      address: true,
      orderItems: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPrice: true,
              image: true,
              sellerId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const orderService = {
  createOrderFromCart,
  getOrderDetails,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  getAllOrdersForAdmin,
};
