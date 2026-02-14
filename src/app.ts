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
import { manufacturerRouter } from "./module/manufacturer/manufacturer.route";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  env.FRONT_END_URL?.replace(/\/$/, ""),
  "https://medi-store-front-end.vercel.app",
  "http://localhost:3000",
].filter(Boolean) as string[];

const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const cleaned = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleaned)) return cb(null, true);
    return cb(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.use(corsMiddleware);

app.options(/.*/, corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "MediStore API is running",
  });
});

// Routes
app.use("/api/categories", categoriesRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/products", medicineRouter);
app.use("/api/manufacturers", manufacturerRouter);

app.use("/api", userRouter);
app.use("/api/cart", cartItemRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/address", addressRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/seller", sellerRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
