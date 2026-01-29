import { Router } from "express";
import authGuard from "../../guard/auth.guard";
import { ROLE } from "../../generated/prisma/enums";
import { reviewController } from "./review.controller";

const router = Router();

// 1. Customer: Create a review
router.post("/", authGuard(ROLE.CUSTOMER), reviewController.createReview);

// 2. Get all reviews for a medicine (public)
router.get("/medicine/:medicineId", reviewController.getMedicineReviews);

// 3. Seller: Get all reviews for their medicines
router.get(
  "/seller",
  authGuard(ROLE.SELLER),
  reviewController.getSellerReviews,
);

// 4. Admin: Delete a review
router.delete(
  "/:reviewId",
  authGuard(ROLE.ADMIN),
  reviewController.deleteReview,
);

export const ReviewRouter = router;
