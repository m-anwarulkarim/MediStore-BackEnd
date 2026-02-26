import { Router } from "express";
import { reviewController } from "./review.controller";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import JwtGuard from "../../guard/jwt.guard";

const router = Router();

// Public: Get all reviews for a medicine
router.get("/medicine/:medicineId", reviewController.getMedicineReviews);

// Customer: Create a review
router.post(
  "/",
  authGuard(ROLE.CUSTOMER),
  JwtGuard(),
  reviewController.createReview,
);

// Customer: Update own review
router.patch(
  "/:reviewId",
  authGuard(ROLE.CUSTOMER),
  JwtGuard(),
  reviewController.updateReview,
);

// Seller: Get all reviews for their medicines
router.get(
  "/seller/all",
  authGuard(ROLE.SELLER),
  JwtGuard(),
  reviewController.getSellerReviews,
);

// Admin: Delete a review
router.delete(
  "/:reviewId",
  authGuard(ROLE.ADMIN),
  JwtGuard(),
  reviewController.deleteReview,
);
router.get(
  "/my",
  authGuard(ROLE.CUSTOMER),
  JwtGuard(),
  reviewController.getMyReview,
);

export const ReviewRouter = router;
