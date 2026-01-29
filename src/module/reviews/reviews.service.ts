import { prisma } from "../../lib/prisma";
import { ROLE } from "../../../generated/prisma/enums";
import type { CreateReviewPayload } from "../../types/reviews";

// =============================
// Create a review for a medicine
// =============================

const createReview = async ({
  userId,
  medicineId,
  orderId,
  rating,
  comment,
}: CreateReviewPayload) => {
  // 1. Validate rating

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // 2. Check if user has ordered this medicine
  const orderItem = await prisma.orderItem.findFirst({
    where: { orderId, medicineId, order: { userId } },
  });

  if (!orderItem) {
    throw new Error("You can only review medicines you have purchased");
  }

  // 3. Check if user already reviewed this medicine for this order
  const existingReview = await prisma.review.findFirst({
    where: { userId, medicineId, orderId },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this medicine for this order");
  }

  // 4. Create review
  const review = await prisma.review.create({
    data: {
      userId,
      medicineId,
      orderId,
      rating,
      comment,
    },
  });

  return review;
};

// =============================
// Get all reviews for a medicine
// =============================
const getMedicineReviews = async (medicineId: string) => {
  return await prisma.review.findMany({
    where: { medicineId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================
// Get all reviews for a seller
// =============================
const getSellerReviews = async (sellerId: string) => {
  return await prisma.review.findMany({
    where: { medicine: { sellerId } },
    include: {
      user: { select: { id: true, name: true } },
      medicine: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================
// Delete a review (Admin only)
// =============================
const deleteReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error("Review not found");

  return await prisma.review.delete({ where: { id: reviewId } });
};

export const reviewService = {
  createReview,
  getMedicineReviews,
  getSellerReviews,
  deleteReview,
};
