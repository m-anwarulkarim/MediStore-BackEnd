import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  ROLE,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type {
  CreateOrderPayload,
  UpdateOrderStatusPayload,
} from "../../types/order";
import type { USER_ROLE } from "../../types/userRole";
import { generateOrderNumber } from "../../ui/generateOrderNumber";

const createOrderFromCart = async ({
  userId,
  addressId,
  customerNote,
}: CreateOrderPayload) => {
  return await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { medicine: true },
    });

    if (cartItems.length === 0) throw new Error("Cart is empty");

    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.medicine.isActive)
        throw new Error(`${item.medicine.name} is not available`);

      if (item.medicine.stock < item.quantity)
        throw new Error(`Insufficient stock for ${item.medicine.name}`);

      const price = item.medicine.discountPrice ?? item.medicine.price;
      subtotal += Number(price) * item.quantity;
    }

    const deliveryCharge = 0;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

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

// =========================
// Get single order details
// =========================
const getOrderDetails = async (
  orderId: string,
  userId: string,
  role: USER_ROLE,
) => {
  // Fetch order with items and medicine info
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

  // Authorization check: Customer can only access their own orders
  if (role === ROLE.CUSTOMER && order.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Seller/Admin can access all orders (Admin full, Seller could filter by their medicines if needed)

  return order;
};

// =========================
// Get all orders of a user
// =========================
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
    orderBy: { createdAt: "desc" }, // latest order first
  });
};

// =========================
// Get Seller Orders (Grouped by Order)
// =========================
const getSellerOrders = async (sellerId: string) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { medicine: { sellerId } },
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

  // Group by orderId
  const grouped: Record<string, any> = {};
  orderItems.forEach((item) => {
    const orderId = item.orderId;
    if (!grouped[orderId]) {
      grouped[orderId] = {
        ...item.order,
        orderItems: [],
      };
    }
    grouped[orderId].orderItems.push(item);
  });

  return Object.values(grouped);
};

/// =========================
// Update Order Status
// =========================
const updateOrderStatus = async ({
  orderId,
  status,
  userRole,
  userId,
}: UpdateOrderStatusPayload) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) throw new Error("Order not found");

    if (order.status === ORDER_STATUS.DELIVERED)
      throw new Error("Delivered order cannot be updated");

    // Seller rules
    if (userRole === ROLE.SELLER) {
      const sellerItem = await tx.orderItem.findFirst({
        where: { orderId, medicine: { sellerId: userId } },
      });
      if (!sellerItem) throw new Error("Unauthorized order access");

      if (status === ORDER_STATUS.CANCELLED)
        throw new Error("Seller cannot cancel order");
    }

    // Customer rules
    if (userRole === ROLE.CUSTOMER) {
      if (order.userId !== userId) throw new Error("Unauthorized");
      if (
        status !== ORDER_STATUS.CANCELLED ||
        order.status !== ORDER_STATUS.PLACED
      ) {
        throw new Error("Invalid order status change");
      }
    }

    // Stock rollback on cancel
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

    const deliveredAt =
      status === ORDER_STATUS.DELIVERED ? new Date() : order.deliveredAt;

    return await tx.order.update({
      where: { id: orderId },
      data: { status, deliveredAt },
    });
  });
};

// =========================
// Admin: get all orders
// =========================
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
