import type { ROLE } from "../../generated/prisma/enums";

export interface CreateOrderPayload {
  userId: string;
  addressId: string;
  customerNote?: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: ORDER_STATUS;
  userRole: ROLE;
  userId: string;
}
