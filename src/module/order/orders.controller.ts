import status from "http-status";
import type { Request, Response } from "express";
import { orderService } from "./orders.service";
import { ROLE } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createOrder = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { addressId, customerNote } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await orderService.createOrderFromCart({
      userId: user.id,
      addressId,
      customerNote,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Get single order details
// =========================
const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { orderId } = req.params;

    if (!user) {
      return res.status(status.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let actorId = user.id;

    // 🔥 seller হলে sellerProfile.id পাঠাও
    if (user.role === ROLE.SELLER) {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!sellerProfile) {
        return res.status(status.NOT_FOUND).json({
          success: false,
          message: "Seller profile not found",
        });
      }

      actorId = sellerProfile.id;
    }

    const order = await orderService.getOrderDetails(
      orderId as string,
      actorId,
      user.role,
    );

    return res.status(status.OK).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    const msg = error?.message || "Failed to fetch order";

    let code: number = status.BAD_REQUEST;
    if (msg.includes("Unauthorized")) code = status.FORBIDDEN;
    else if (msg.includes("not found")) code = status.NOT_FOUND;

    return res.status(code).json({
      success: false,
      message: msg,
    });
  }
};

// =========================
// Get all orders of a user
// =========================
const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await orderService.getUserOrders(user.id);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Get all orders for a seller
// =========================

const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== ROLE.SELLER) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!sellerProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Seller profile not found" });
    }

    const orders = await orderService.getSellerOrders(sellerProfile.id);

    return res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    //  normalize orderId
    const rawOrderId = (req.params as any)?.orderId;
    const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

    const { status } = req.body as { status: string };

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    //  IMPORTANT: seller must pass sellerProfile.id (not user.id)
    let actorId = user.id;

    if (user.role === ROLE.SELLER) {
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!sellerProfile) {
        return res.status(404).json({
          success: false,
          message: "Seller profile not found",
        });
      }

      actorId = sellerProfile.id; //  SellerProfile.id
    }

    //  allow CUSTOMER cancel flow (service already validates)
    const updatedOrder = await orderService.updateOrderStatus({
      orderId,
      status: status as any,
      userRole: user.role,
      userId: actorId, //  for seller it's sellerProfile.id
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// =========================
// Admin: get all orders
// =========================
const getAllOrdersForAdmin = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await orderService.getAllOrdersForAdmin();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const orderController = {
  createOrder,
  getOrderDetails,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  getAllOrdersForAdmin,
};
