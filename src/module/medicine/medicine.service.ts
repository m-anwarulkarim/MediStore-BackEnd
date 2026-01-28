import { prisma } from "../../lib/prisma";
import slugify from "slugify";
import type {
  CreateMedicineInput,
  GetMedicineInput,
  UpdateMedicineInput,
} from "../../types/Medicine";

// ==============================
// Service: Create a new medicine
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

  // Validate discountPrice
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
    },
  });

  return result;
};

// ==============================
// Service: Get medicines (filters + pagination + search + sort)
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
// Service: Update medicine
// ==============================
const updateMedicine = async (data: UpdateMedicineInput) => {
  const { medicineId, sellerId, name, categoryId, price, discountPrice } = data;

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });
  if (!medicine) throw new Error("Medicine not found");
  if (medicine.sellerId !== sellerId)
    throw new Error("Unauthorized: You can only update your own medicines");

  // Validate discountPrice
  if (discountPrice != null && price != null && discountPrice >= price)
    throw new Error("Discount price must be less than original price");

  // Category validation
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new Error("Invalid category");
  }

  // Update slug if name changes
  let slug;
  if (name && name !== medicine.name) {
    slug = slugify(name, { lower: true, strict: true, trim: true });
    const existing = await prisma.medicine.findUnique({
      where: { slug_sellerId: { slug, sellerId } },
    });
    if (existing) throw new Error("Medicine with this name already exists");
  }

  const updatedMedicine = await prisma.medicine.update({
    where: { id: medicineId },
    data: { ...data, slug: slug || medicine.slug },
  });

  return updatedMedicine;
};
// ==============================
// Service: Delete medicine
// ==============================
const removeMedicine = async ({
  medicineId,
  sellerId,
}: {
  medicineId: string;
  sellerId: string;
}) => {
  // 1. Check if medicine exists
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  // 2. Ensure seller owns this medicine
  if (medicine.sellerId !== sellerId) {
    throw new Error("Unauthorized: You can only delete your own medicines");
  }

  // 3. Delete medicine
  await prisma.medicine.delete({
    where: { id: medicineId },
  });

  return { message: "Medicine deleted successfully" };
};
// ==============================
// Service:  Get single medicine details
// ==============================
const getMedicineDetails = async (medicineId: string) => {
  const medicine = await prisma.medicine.findFirst({
    where: {
      id: medicineId,
      isActive: true,
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          shopName: true,
          isVerified: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  return medicine;
};

export const medicineService = {
  createMedicine,
  getAllMedicine,
  updateMedicine,
  removeMedicine,
  getMedicineDetails,
};
