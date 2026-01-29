import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { env } from "./config/env";
import { auth } from "./lib/auth";
import { userRouter } from "./module/auth/auth.route";
import { medicineRouter } from "./module/medicine/medicine.route";
import { categoriesRouter } from "./module/categories/categories.route";
import { sellerRouter } from "./module/SellerProfile/sellerProfile.route";
import { OrderRouter } from "./module/order/orders.route";
import { addressRouter } from "./module/Address/address.route";
import { cartItemRouter } from "./module/cartItem/cartItem.route";

const app = express();

// ------------------- CORS -------------------
app.use(
  cors({
    origin: env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// ------------------- Better Auth -------------------
app.all("/api/auth/*splat", toNodeHandler(auth));

// ------------------- Body Parser -------------------
app.use(express.json());

// ------------------- Routes -------------------
app.use("/api", userRouter);

app.use("/api", categoriesRouter);
//---------
app.use("/api/seller", medicineRouter);

app.use("/api/orders", OrderRouter);

// -----------

app.use("/api", sellerRouter);

app.use("/api/address", addressRouter);

app.use("/api/cart-item", cartItemRouter);
// ------------
app.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false, // 24-hour format
    }),
  });
});

// ------------------- Catch-all Route -------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const localTime = new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    hour12: false,
  });

  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    timestamp: localTime,
    suggestion: "Please check the URL or API documentation",
  });
});

export default app;
