import { prisma } from "../../lib/prisma";
import { slugify } from "../../ui/slugify";

const createCategories = async (
  name: string,
  userId: string,
  slug?: string,
  image?: string,
  description?: string,
) => {
  try {
    // ================== Slug ==================
    let safeSlug: string;

    if (slug && typeof slug === "string") {
      safeSlug = slugify(slug);
    } else if (name) {
      safeSlug = slugify(name);
    } else {
      throw new Error("Category name is required");
    }

    // ================== Duplicate Check ==================
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug: safeSlug }],
      },
    });

    if (existingCategory) {
      throw new Error("Category with this name or slug already exists");
    }

    // ================== Create ==================
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

// ======================getAllCategory===================

const getAllCategory = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        medicines: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Get all category service error:", error);
    throw new Error("Failed to fetch categories");
  }
};

// ============updateCategory============
const updateCategory = async (
  categoryId: string,
  name?: string,
  slug?: string,
) => {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const safeSlug =
      slug && typeof slug === "string" ? slugify(slug) : undefined;

    // Duplicate check
    if (name || safeSlug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          id: { not: categoryId },
          OR: [
            name ? { name } : undefined,
            safeSlug ? { slug: safeSlug } : undefined,
          ].filter(Boolean) as any,
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
      },
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    throw error;
  }
};
// =========deleteCategory========
const deleteCategory = async (categoryId: string, userId: string) => {
  try {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      include: {
        _count: { select: { medicines: true } },
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found or unauthorized");
    }

    if (existingCategory._count.medicines > 0) {
      throw new Error("Cannot delete category with medicines");
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: false,
      },
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// ====================== getSingleCategory ===================
const getSingleCategory = async (id: string) => {
  try {
    const result = await prisma.category.findUnique({
      where: {
        id: id,
      },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });
    console.log(result);
    if (!result) {
      throw new Error("Category not found");
    }

    return result;
  } catch (error: any) {
    console.error("Error fetching single category:", error);
    throw error;
  }
};

// ====================== Export Updated ======================
export const CategoriesService = {
  createCategories,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory, // এটি যোগ করা হলো
};
