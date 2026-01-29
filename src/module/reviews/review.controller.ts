import type { Request, Response } from "express";
import { reviewService } from "./reviews.service";
import { ROLE } from "../../generated/prisma/enums";

// =============================
// 1. Create a review (Customer only)
// =============================

const createReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { medicineId, orderId, rating, comment } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role !== ROLE.CUSTOMER) {
      return res
        .status(403)
        .json({ message: "Only customers can create reviews" });
    }

    const review = await reviewService.createReview({
      userId: user.id,
      medicineId,
      orderId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// 2. Get all reviews for a medicine
// =============================
const getMedicineReviews = async (req: Request, res: Response) => {
  try {
    const { medicineId } = req.params;

    const reviews = await reviewService.getMedicineReviews(
      medicineId as string,
    );

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// 3. Get all reviews for a seller
// =============================
const getSellerReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== ROLE.SELLER) {
      return res
        .status(403)
        .json({ message: "Only sellers can view their reviews" });
    }

    const reviews = await reviewService.getSellerReviews(user.id);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// 4. Delete a review (Admin only)
// =============================
const deleteReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { reviewId } = req.params;

    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }

    await reviewService.deleteReview(reviewId as string);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const reviewController = {
  createReview,
  getMedicineReviews,
  getSellerReviews,
  deleteReview,
};
