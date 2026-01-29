import type { Request, Response } from "express";
import { sellerProfileService } from "./sellerProfile.service";
import { ROLE } from "../../generated/prisma/enums";
import type {
  CreateSellerProfilePayload,
  UpdateSellerProfilePayload,
} from "../../types/SellerProfile";

const createSellerProfile = async (
  req: Request<{}, {}, CreateSellerProfilePayload>,
  res: Response,
) => {
  try {
    const user = req.user;

    //  Auth check
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    //  Only SELLER role
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create seller profile",
      });
    }

    const { shopName, shopDescription, licenseNumber } = req.body;

    if (!shopName) {
      return res.status(400).json({
        success: false,
        message: "shopName is required",
      });
    }

    const sellerProfile = await sellerProfileService.createSellerProfile({
      userId: user.id,
      shopName,
      shopDescription,
      licenseNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Seller profile created successfully",
      data: sellerProfile,
    });
  } catch (error: any) {
    console.error("Create seller profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create seller profile",
    });
  }
};
// ==========================

const updateSellerProfile = async (
  req: Request<{}, {}, UpdateSellerProfilePayload>,
  res: Response,
) => {
  try {
    const user = req.user;
    const { shopName, shopDescription, shopLogo, licenseNumber } = req.body;

    //  Auth check
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    //  Only SELLER
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can update seller profile",
      });
    }

    if (!shopName && !shopDescription && !shopLogo && !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const updatedProfile = await sellerProfileService.updateSellerProfile({
      userId: user.id,
      shopName,
      shopDescription,
      shopLogo,
      licenseNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Seller profile updated successfully",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("Update seller profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update seller profile",
    });
  }
};
// ==========

const getCurrentSellerProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    //  Auth check
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    //  Only SELLER
    if (user.role !== ROLE.SELLER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access seller profile",
      });
    }

    const sellerProfile = await sellerProfileService.getCurrentSellerProfile(
      user.id,
    );

    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller profile fetched successfully",
      data: sellerProfile,
    });
  } catch (error: any) {
    console.error("Get current seller profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller profile",
    });
  }
};

// ===================

const getAllSellers = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    //  Auth check
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    //  Admin only
    if (user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admin can access all sellers",
      });
    }

    const sellers = await sellerProfileService.getAllSellers();

    return res.status(200).json({
      success: true,
      message: "All sellers fetched successfully",
      data: sellers,
    });
  } catch (error: any) {
    console.error("Get all sellers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sellers",
    });
  }
};

export const sellerProfileController = {
  createSellerProfile,
  updateSellerProfile,
  getCurrentSellerProfile,
  getAllSellers,
};
