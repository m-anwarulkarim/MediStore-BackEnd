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

// Configure CORS middleware
app.use(
  cors({
    origin: env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use((req, _res, next) => {
  if (req.path.includes("/api/auth")) {
    console.log("AUTH REQ:", {
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      referer: req.headers.referer,
      cookie: req.headers.cookie ? "has-cookie" : "no-cookie",
    });
  }
  next();
});

// app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/auth/*splat", toNodeHandler(auth));

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "MediStore API is running",
  });
});

/* =====================================================
   API ROUTES
===================================================== */
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

/* =====================================================
   404 HANDLER
===================================================== */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
