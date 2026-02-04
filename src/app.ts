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
import { ReviewRouter } from "./module/reviews/reviews.route";

const app = express();

// ------------------- CORS -------------------
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ------------------- Body Parser -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------- Better Auth -------------------
app.all("/api/auth/*splat", toNodeHandler(auth));

// ------------------- Health Check -------------------
app.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "MediStore API is running",
    timestamp: new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false,
    }),
  });
});

// ------------------- Public Routes -------------------
app.use("/api/categories", categoriesRouter);
app.use("/api/medicines", medicineRouter);

// ------------------- User/Auth Routes -------------------
app.use("/api", userRouter);

// ------------------- Customer Routes -------------------
app.use("/api/cart", cartItemRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/address", addressRouter);
app.use("/api/reviews", ReviewRouter);

// ------------------- Seller Routes -------------------
app.use("/api/seller", sellerRouter);

// ------------------- Admin Routes -------------------
// Admin routes are handled within individual routers with proper guards

// ------------------- 404 Handler -------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const localTime = new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    hour12: false,
  });

  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
    timestamp: localTime,
    suggestion: "Please check the URL or API documentation",
  });
});

// ------------------- Global Error Handler -------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  const timestamp = new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    hour12: false,
  });

  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
