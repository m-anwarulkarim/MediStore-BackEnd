import type { Request, Response } from "express";
import { reviewService } from "./reviews.service";

// 1. Create review
const createReview = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { medicineId, orderId, rating, comment } = req.body;

    const review = await reviewService.createReview({
      userId: user.id,
      medicineId,
      orderId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 2. Get medicine reviews
const getMedicineReviews = async (req: Request, res: Response) => {
  try {
    const { medicineId } = req.params;

    const reviews = await reviewService.getMedicineReviews(
      medicineId as string,
    );

    return res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 3. Seller reviews
const getSellerReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const reviews = await reviewService.getSellerReviews(user.id);

    return res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 4. Delete review
const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    await reviewService.deleteReview(reviewId as string);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 5. Update own review
const updateReview = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const updated = await reviewService.updateReview(
      reviewId as string,
      user.id,
      rating,
      comment,
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const getMyReview = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { orderId, medicineId } = req.query;

    const review = await reviewService.getMyReview(
      user.id,
      String(orderId),
      String(medicineId),
    );

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reviewController = {
  createReview,
  getMedicineReviews,
  getSellerReviews,
  deleteReview,
  updateReview,
  getMyReview,
};
