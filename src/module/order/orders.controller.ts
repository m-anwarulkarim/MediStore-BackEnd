import type { Request, Response } from "express";
import { OrderService } from "./orders.service";

const createOrder = async (req: Request, res: Response) => {
  const data = await OrderService.createOrder();
};

export const OrderController = {
  createOrder,
};
