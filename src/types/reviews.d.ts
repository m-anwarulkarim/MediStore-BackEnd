export interface CreateReviewPayload {
  userId: string;
  medicineId: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string;
}
