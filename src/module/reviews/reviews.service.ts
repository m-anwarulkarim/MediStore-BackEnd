import { ORDER_STATUS } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
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
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // 2. Validate comment
  if (!comment || comment.trim().length === 0) {
    throw new Error("Review comment is required");
  }

  if (comment.trim().length < 10) {
    throw new Error("Review comment must be at least 10 characters");
  }

  if (comment.length > 1000) {
    throw new Error("Review comment must not exceed 1000 characters");
  }

  // 3. Check if user has ordered this medicine
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      orderId,
      medicineId,
      order: { userId },
    },
    include: {
      order: true,
    },
  });

  if (!orderItem) {
    throw new Error("You can only review medicines you have purchased");
  }

  // 4. Check if order is delivered (optional but recommended)
  if (orderItem.order.status !== ORDER_STATUS.DELIVERED) {
    throw new Error("You can only review after the order is delivered");
  }

  // 5. Check if user already reviewed this medicine for this order
  const existingReview = await prisma.review.findFirst({
    where: { userId, medicineId, orderId },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this medicine for this order");
  }

  // 6. Create review
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        userId,
        medicineId,
        orderId,
        rating,
        comment: comment?.trim() || null,
        isVerified: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        medicine: { select: { id: true, name: true } },
      },
    });

    // update rating using tx
    const result = await tx.review.aggregate({
      where: { medicineId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avg = result._avg.rating;
    const count = result._count.rating;

    await tx.medicine.update({
      where: { id: medicineId },
      data: { rating: count === 0 ? null : Math.round((avg ?? 0) * 10) / 10 },
    });

    return created;
  });

  return review;
};

// =============================
// Helper: Update medicine average rating
// =============================
const updateMedicineRating = async (medicineId: string) => {
  const result = await prisma.review.aggregate({
    where: { medicineId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avg = result._avg.rating;
  const count = result._count.rating;

  await prisma.medicine.update({
    where: { id: medicineId },
    data: {
      rating: count === 0 ? null : Math.round((avg ?? 0) * 10) / 10,
    },
  });
};
// =============================
// Get all reviews for a medicine
// =============================
const getMedicineReviews = async (medicineId: string) => {
  return await prisma.review.findMany({
    where: { medicineId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
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
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      medicine: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================
// Delete a review (Admin only)
// =============================
const deleteReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { medicineId: true },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  await prisma.review.delete({ where: { id: reviewId } });

  // Update medicine rating after deletion
  await updateMedicineRating(review.medicineId);

  return { message: "Review deleted successfully" };
};

// =============================
// Update a review (Optional - Customer updates their own review)
// =============================
const updateReview = async (
  reviewId: string,
  userId: string,
  rating?: number,
  comment?: string,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId !== userId) {
    throw new Error("Unauthorized to update this review");
  }

  // Validation
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (comment !== undefined) {
    if (comment.trim().length < 10) {
      throw new Error("Review comment must be at least 10 characters");
    }
    if (comment.length > 1000) {
      throw new Error("Review comment must not exceed 1000 characters");
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(rating !== undefined && { rating }),
      ...(comment !== undefined && { comment: comment.trim() }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update medicine rating
  await updateMedicineRating(review.medicineId);

  return updatedReview;
};

const getMyReview = async (
  userId: string,
  orderId: string,
  medicineId: string,
) => {
  return prisma.review.findFirst({
    where: {
      userId,
      orderId,
      medicineId,
    },
  });
};
export const reviewService = {
  createReview,
  getMedicineReviews,
  getSellerReviews,
  deleteReview,
  updateReview,
  getMyReview,
};
