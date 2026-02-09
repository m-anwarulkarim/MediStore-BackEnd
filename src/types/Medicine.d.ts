// ==============================
// Controller Types
// ==============================
export interface CreateMedicineInput {
  name: string;
  description: string;
  manufacturer: string;
  price: number;
  categoryId: string;
  userId: string; // seller ID
  discountPrice?: number;
  dosageForm?: string;
  strength?: string;
  prescriptionRequired?: boolean;
  images?: string[];
}

export interface GetMedicineInput {
  id?: string;
  slug?: string;
  categoryId?: string;
  sellerId?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateMedicinePayload {
  name?: string;
  description?: string;
  manufacturer?: string;
  price?: number;
  categoryId?: string;
  discountPrice?: number;
  dosageForm?: string;
  strength?: string;
  prescriptionRequired?: boolean;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

// ==============================
// Service Types
// ==============================
export interface CreateMedicinePayload {
  name: string;
  description: string;
  manufacturer: string;
  price: number;
  categoryId: string;
  discountPrice?: number;
  dosageForm?: string;
  strength?: string;
  prescriptionRequired?: boolean;
  images?: string[];
}

export interface UpdateMedicineInput {
  medicineId: string;
  sellerId: string; // logged-in seller
  name?: string;
  description?: string;
  manufacturer?: string;
  price?: number;
  categoryId?: string;
  discountPrice?: number;
  dosageForm?: string;
  strength?: string;
  prescriptionRequired?: boolean;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}
export type UpdateStockPayload = {
  stock: number;
};

export type UpdateStockInput = {
  medicineId: string;
  sellerId: string; // SellerProfile.id
  stock: number;
};
