import type { Request, Response } from "express";
import { addressService } from "./address.service";
import { ROLE } from "../../generated/prisma/enums";

const cleanOptionalString = (v: unknown) => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
};

const cleanRequiredString = (v: unknown) => {
  if (typeof v !== "string") return "";
  return v.trim();
};

// ==========================
// 1. Create address
// ==========================
const createAddress = async (req: Request, res: Response) => {
  try {
    console.log("REQ state:", req.body.state, typeof req.body.state);

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const fullName = cleanRequiredString(req.body.fullName);
    const phone = cleanRequiredString(req.body.phone);
    const city = cleanRequiredString(req.body.city);
    const addressLine = cleanRequiredString(req.body.addressLine);

    if (!fullName || !phone || !city || !addressLine) {
      return res.status(400).json({
        success: false,
        message: "Required fields: fullName, phone, city, addressLine",
      });
    }

    // Validate phone number format (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    const address = await addressService.createAddress({
      userId: user.id,
      fullName,
      phone,
      country: cleanOptionalString(req.body.country) ?? "Bangladesh",
      city,

      //  optional fields (safe)
      state: cleanOptionalString(req.body.state),
      area: cleanOptionalString(req.body.area),
      postalCode: cleanOptionalString(req.body.postalCode),
      label: cleanOptionalString(req.body.label),

      addressLine,
      isDefault: Boolean(req.body.isDefault),
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Create address error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create address",
    });
  }
};

// ==========================
// 2. Update address
// ==========================
const updateAddress = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addressId = req.params.id;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    const updatedAddress = await addressService.updateAddress({
      id: addressId as string,
      userId: user.id,

      fullName: cleanOptionalString(req.body.fullName),
      phone: cleanOptionalString(req.body.phone),
      country: cleanOptionalString(req.body.country),
      city: cleanOptionalString(req.body.city),
      state: cleanOptionalString(req.body.state),
      area: cleanOptionalString(req.body.area),
      postalCode: cleanOptionalString(req.body.postalCode),
      addressLine: cleanOptionalString(req.body.addressLine),
      label: cleanOptionalString(req.body.label),

      isDefault:
        typeof req.body.isDefault === "boolean"
          ? req.body.isDefault
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error: any) {
    console.error("Update address error:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("Unauthorized")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// ==========================
// 3. Delete address
// ==========================
const deleteAddress = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addressId = req.params.id;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    const deletedAddress = await addressService.deleteAddress(
      addressId as string,
      user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: deletedAddress,
    });
  } catch (error: any) {
    console.error("Delete address error:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("Unauthorized")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

// ==========================
// 4. Get all addresses (ADMIN only)
// ==========================
const getAllAddresses = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const addresses = await addressService.getAllAddresses();

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error: any) {
    console.error("Get all addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

// ==========================
// 5. Get my addresses
// ==========================
const getMyAddresses = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addresses = await addressService.getMyAddresses(user.id);

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error: any) {
    console.error("Get my addresses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

// ==========================
// 6. Get single address by ID
// ==========================
const getMyAddressById = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addressId = req.params.id;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    const address = await addressService.getMyAddressById(
      user.id,
      addressId as string,
    );

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error: any) {
    console.error("Get address by ID error:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
    });
  }
};

export const addressController = {
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  getMyAddresses,
  getMyAddressById,
};
