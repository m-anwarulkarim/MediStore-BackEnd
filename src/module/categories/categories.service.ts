import { prisma } from "../../lib/prisma";
import { slugify } from "../../ui/slugify";

// ================== createCategories ==================
const createCategories = async (
  name: string,
  userId: string,
  slug?: string,
  image?: string,
  description?: string,
) => {
  try {
    let safeSlug: string;

    if (slug && typeof slug === "string") {
      safeSlug = slugify(slug);
    } else if (name) {
      safeSlug = slugify(name);
    } else {
      throw new Error("Category name is required");
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug: safeSlug }],
      },
    });

    if (existingCategory) {
      throw new Error("Category with this name or slug already exists");
    }

    const result = await prisma.category.create({
      data: {
        name,
        slug: safeSlug,
        userId,
        image: image,
        description: description,
      },
    });

    return result;
  } catch (error: any) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// ====================== getAllCategory ===================
const getAllCategory = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { medicines: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return categories;
  } catch (error) {
    console.error("Get all category service error:", error);
    throw new Error("Failed to fetch categories");
  }
};

// ====================== updateCategory ===================
const updateCategory = async (
  categoryId: string,
  updateData: {
    name?: string;
    slug?: string;
    image?: string;
    description?: string;
  },
) => {
  const { name, slug, image, description } = updateData;

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Slug logic: prioritize provided slug, then name, else keep existing
    let safeSlug = undefined;
    if (slug) {
      safeSlug = slugify(slug);
    } else if (name) {
      safeSlug = slugify(name);
    }

    // Duplicate check for other categories
    if (name || safeSlug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          id: { not: categoryId },
          OR: [
            ...(name ? [{ name }] : []),
            ...(safeSlug ? [{ slug: safeSlug }] : []),
          ],
        },
      });

      if (duplicate) {
        throw new Error("Category with this name or slug already exists");
      }
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(safeSlug && { slug: safeSlug }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
      },
    });
  } catch (error: any) {
    console.error("Error updating category in service:", error);
    throw error;
  }
};

// ====================== deleteCategory ===================
const deleteCategory = async (categoryId: string) => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    if (existingCategory._count.medicines > 0) {
      throw new Error(
        "Cannot delete category: It contains linked medicines. Remove medicines first.",
      );
    }
    const result = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: false,
      },
    });

    return result;
  } catch (error: any) {
    console.error("Error in deleteCategory service:", error);
    throw error;
  }
};
// ====================== getSingleCategory ===================
const getSingleCategory = async (id: string) => {
  try {
    const result = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });

    if (!result) {
      throw new Error("Category not found");
    }

    return result;
  } catch (error: any) {
    console.error("Error fetching single category:", error);
    throw error;
  }
};

// ====================== Export ======================
export const CategoriesService = {
  createCategories,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory,
};
