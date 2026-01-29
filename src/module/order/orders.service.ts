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
  // 1️. Fetch cart items with medicine info
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { medicine: true },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // 2️. Calculate totals
  let subtotal = 0;
  cartItems.forEach((item) => {
    const price = item.medicine.discountPrice ?? item.medicine.price;
    subtotal += Number(price) * item.quantity;
  });

  const deliveryCharge = 0;
  const discount = 0;
  const total = subtotal + deliveryCharge - discount;

  // 3️. Check stock before creating order
  for (const item of cartItems) {
    if (item.medicine.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.medicine.name}`);
    }
  }

  // 4️. Create Order
  const order = await prisma.order.create({
    data: {
      userId,
      addressId,
      orderNumber: generateOrderNumber(),
      subtotal,
      deliveryCharge,
      discount,
      total,
      customerNote,
      status: ORDER_STATUS.PENDING,
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

  // 5️. Deduct stock for each medicine
  for (const item of cartItems) {
    await prisma.medicine.update({
      where: { id: item.medicineId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // 6️. Clear user cart
  // assume cartItems = array of cart items fetched from DB
  const cartItemIds = cartItems.map((item) => item.id);

  // Delete only these cart items
  await prisma.cartItem.deleteMany({
    where: {
      id: {
        in: cartItemIds,
      },
    },
  });
  return order;
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
// Get all orders for a seller
// =========================
const getSellerOrders = async (sellerId: string) => {
  // 1️. Find all medicines by this seller
  const medicines = await prisma.medicine.findMany({
    where: { sellerId },
    select: { id: true },
  });

  const medicineIds = medicines.map((m) => m.id);

  if (medicineIds.length === 0) {
    return []; // Seller has no medicines, hence no orders
  }

  // 2️. Fetch orderItems for these medicines
  const orderItems = await prisma.orderItem.findMany({
    where: { medicineId: { in: medicineIds } },
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
          image: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orderItems;
};
// =========================
// Update Order Status
// =========================
const updateOrderStatus = async ({
  orderId,
  status,
  userRole,
  userId,
}: UpdateOrderStatusPayload) => {
  // 1️. Fetch order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Order not found");

  // 2️. Authorization check
  if (userRole === ROLE.SELLER) {
    // Seller can only update orders that contain their medicines
    const sellerOrderItems = await prisma.orderItem.findFirst({
      where: {
        orderId,
        medicine: { sellerId: userId },
      },
    });
    if (!sellerOrderItems) {
      throw new Error(
        "Unauthorized: This order does not belong to your medicines",
      );
    }
  }

  // 3️.  deliveredAt auto set*******************************
  const deliveredAt = status === "DELIVERED" ? new Date() : order.deliveredAt;

  // 4️. Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      deliveredAt,
    },
  });

  return updatedOrder;
};

export const orderService = {
  createOrderFromCart,
  getOrderDetails,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
};
