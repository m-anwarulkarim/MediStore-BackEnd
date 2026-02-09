import type { Request, Response } from "express";
import { orderService } from "./orders.service";
import { ROLE } from "../../generated/prisma/enums";

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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await orderService.getOrderDetails(
      orderId as string,
      user.id,
      user.role,
    );

    res.status(200).json({
      success: true,
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await orderService.getSellerOrders(user.id);

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

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { orderId } = req.params as any;
    const { status } = req.body;
    if (user?.role === ROLE.CUSTOMER) {
      return res
        .status(403)
        .json({ message: "Customers cannot update order status" });
    }
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const updatedOrder = await orderService.updateOrderStatus({
      orderId,
      status,
      userRole: user.role,
      userId: user.id,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(400).json({
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
