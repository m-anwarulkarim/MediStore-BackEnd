import { ROLE, USER_STATUS } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type {
  CreateSellerProfileInput,
  UpdateSellerProfileInput,
} from "../../types/SellerProfile";

const createSellerProfile = async ({
  userId,
  shopName,
  shopDescription,
  licenseNumber,
}: CreateSellerProfileInput) => {
  try {
    //  User exist check
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== ROLE.SELLER) {
      throw new Error("User is not a seller");
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new Error("User is not active");
    }
    //  Already has seller profile?
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error("Seller profile already exists");
    }

    //  Create seller profile
    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        userId,
        shopName,
        shopDescription,
        licenseNumber,
      },
    });

    return sellerProfile;
  } catch (error) {
    console.error("Create seller profile service error:", error);
    throw error;
  }
};

// ====================

const updateSellerProfile = async ({
  userId,
  shopName,
  shopDescription,
  shopLogo,
  licenseNumber,
}: UpdateSellerProfileInput) => {
  try {
    //  Seller profile find
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new Error("Seller profile not found");
    }

    //  License number unique check
    if (licenseNumber) {
      const existingLicense = await prisma.sellerProfile.findFirst({
        where: {
          licenseNumber,
          NOT: { id: sellerProfile.id },
        },
      });

      if (existingLicense) {
        throw new Error("License number already in use");
      }
    }

    if (!userId) {
      throw new Error("User id is required");
    }
    if (!shopName && !shopDescription && !shopLogo && !licenseNumber) {
      throw new Error("Nothing to update");
    }

    //  Update profile
    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: sellerProfile.id },
      data: {
        shopName,
        shopDescription,
        shopLogo,
        licenseNumber,
      },
    });

    return updatedProfile;
  } catch (error) {
    console.error("Update seller profile service error:", error);
    throw error;
  }
};
// ============
const getCurrentSellerProfile = async (userId: string) => {
  try {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        medicines: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!sellerProfile) {
      throw new Error("Seller profile not found");
    }
    return sellerProfile;
  } catch (error) {
    console.error("Get current seller profile service error:", error);
    throw error;
  }
};
// =================
const getAllSellers = async () => {
  try {
    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            role: true,
          },
        },
        _count: {
          select: {
            medicines: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sellers.map((seller) => ({
      id: seller.id,
      shopName: seller.shopName,
      shopDescription: seller.shopDescription,
      shopLogo: seller.shopLogo,
      licenseNumber: seller.licenseNumber,
      isVerified: seller.isVerified,
      createdAt: seller.createdAt,
      user: seller.user,
      totalMedicines: seller._count.medicines,
    }));
  } catch (error) {
    console.error("Get all sellers service error:", error);
    throw error;
  }
};

export const sellerProfileService = {
  createSellerProfile,
  updateSellerProfile,
  getCurrentSellerProfile,
  getAllSellers,
};
