import type { Request, Response } from "express";
import { OrderService } from "./orders.service";

const createOrder = async (req: Request, res: Response) => {
  const data = await OrderService.createOrder();
  res.status(200).json({
    message: "Hello",
    data: data,
  });
};

export const OrderController = {
  createOrder,
};
