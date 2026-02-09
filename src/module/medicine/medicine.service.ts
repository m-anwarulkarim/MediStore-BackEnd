import { prisma } from "../../lib/prisma";
import slugify from "slugify";
import type {
  CreateMedicineInput,
  GetMedicineInput,
  UpdateMedicineInput,
} from "../../types/Medicine";

// ==============================
// Create a new medicine
// ==============================
const createMedicine = async ({
  name,
  description,
  manufacturer,
  price,
  categoryId,
  userId,
  discountPrice,
  dosageForm,
  strength,
  prescriptionRequired,
  images,
}: CreateMedicineInput) => {
  if (!userId) throw new Error("User id is required");

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId },
  });
  if (!sellerProfile) throw new Error("Seller profile not found");

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw new Error("Invalid category");

  if (discountPrice != null && discountPrice >= price)
    throw new Error("Discount price must be less than original price");

  const slug = slugify(name, { lower: true, strict: true, trim: true });

  const existingMedicine = await prisma.medicine.findUnique({
    where: { slug_sellerId: { slug, sellerId: sellerProfile.id } },
  });
  if (existingMedicine) throw new Error(`Medicine "${name}" already exists`);

  const result = await prisma.medicine.create({
    data: {
      name,
      slug,
      description,
      manufacturer,
      price,
      categoryId,
      sellerId: sellerProfile.id,
      discountPrice,
      dosageForm,
      strength,
      prescriptionRequired,
      images,
      isActive: true,
    },
  });

  return result;
};

// ==============================
// Get medicines (filters + pagination + search + sort)
// ==============================
const getAllMedicine = async ({
  id,
  slug,
  categoryId,
  sellerId,
  page = 1,
  limit = 10,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetMedicineInput) => {
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  const where: any = { isActive: true };
  if (id) where.id = id;
  if (slug) where.slug = slug;
  if (categoryId) where.categoryId = categoryId;
  if (sellerId) where.sellerId = sellerId;
  if (search)
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { manufacturer: { contains: search, mode: "insensitive" } },
    ];

  const skip = (page - 1) * limit;

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      include: {
        category: true,
        seller: { select: { id: true, shopName: true, isVerified: true } },
        reviews: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.medicine.count({ where }),
  ]);

  return {
    data: medicines,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ==============================
// Update medicine
// ==============================
const updateMedicine = async (data: UpdateMedicineInput) => {
  const { medicineId, sellerId } = data;

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });
  if (!medicine) throw new Error("Medicine not found");
  if (medicine.sellerId !== sellerId)
    throw new Error("Unauthorized: You can only update your own medicines");

  // Only allowed fields
  const updateData: any = {};

  if (data.name && data.name !== medicine.name) {
    const slug = slugify(data.name, { lower: true, strict: true, trim: true });
    const existing = await prisma.medicine.findUnique({
      where: { slug_sellerId: { slug, sellerId } },
    });

    if (existing) throw new Error("Medicine with this name already exists");
    updateData.name = data.name;
    updateData.slug = slug;
  }
  if (data.description) updateData.description = data.description;

  if (data.manufacturer) updateData.manufacturer = data.manufacturer;

  if (data.price != null) updateData.price = data.price;

  if (data.discountPrice != null) updateData.discountPrice = data.discountPrice;

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) throw new Error("Invalid category");
    updateData.categoryId = data.categoryId;
  }
  if (data.dosageForm) updateData.dosageForm = data.dosageForm;

  if (data.strength) updateData.strength = data.strength;

  if (data.prescriptionRequired != null)
    updateData.prescriptionRequired = data.prescriptionRequired;

  if (data.images) updateData.images = data.images;

  const updatedMedicine = await prisma.medicine.update({
    where: { id: medicineId },
    data: updateData,
  });

  return updatedMedicine;
};

// ==============================
//  delete medicine
// ==============================
const removeMedicine = async ({
  medicineId,
  sellerId,
}: {
  medicineId: string;
  sellerId: string; // SellerProfile.id
}) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true, sellerId: true, isActive: true },
  });

  if (!medicine || !medicine.isActive) {
    throw new Error("Medicine not found");
  }

  if (medicine.sellerId !== sellerId) {
    throw new Error("Unauthorized: You can only delete your own medicines");
  }

  await prisma.medicine.update({
    where: { id: medicineId },
    data: { isActive: false },
  });

  return { message: "Medicine deleted successfully" };
};

// ==============================
// Get single medicine details (with review pagination)
// ==============================
const getMedicineDetails = async (
  medicineId: string,
  reviewPage = 1,
  reviewLimit = 5,
) => {
  const skip = (reviewPage - 1) * reviewLimit;

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    include: {
      category: true,
      seller: { select: { id: true, shopName: true, isVerified: true } },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        skip,
        take: reviewLimit,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!medicine || !medicine.isActive) throw new Error("Medicine not found");

  const totalReviews = await prisma.review.count({ where: { medicineId } });

  return { ...medicine, reviewPage, reviewLimit, totalReviews };
};

//  Stock update service
const updateStock = async ({
  medicineId,
  sellerId, // SellerProfile.id
  stock,
}: {
  medicineId: string;
  sellerId: string;
  stock: number;
}) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true, sellerId: true, isActive: true, stock: true },
  });

  if (!medicine || !medicine.isActive) throw new Error("Medicine not found");

  if (medicine.sellerId !== sellerId) {
    throw new Error("Unauthorized: You can only update your own medicines");
  }

  const updated = await prisma.medicine.update({
    where: { id: medicineId },
    data: { stock },
  });

  return updated;
};

export const medicineService = {
  createMedicine,
  getAllMedicine,
  updateMedicine,
  removeMedicine,
  getMedicineDetails,
  updateStock,
};
