import type { Request, Response } from "express";
import { userService } from "./auth.service";
import { ROLE, USER_STATUS } from "../../../generated/prisma/enums";

// ==========================
// 1. Controller: Get all users (ADMIN only)
// ==========================
const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Only ADMIN can retrieve all users
    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "You can only retrieve your own account",
      });
    }
    const data = await userService.getAllUsers();

    // If no users found
    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No users found",
        data: [],
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in viewAllUsers controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

// ==========================
// 2. Controller: Get current logged-in user
// ==========================
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // Check if user is authenticated
    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch current user data
    const data = await userService.getCurrentUser(user.id);

    // If user not found
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user",
    });
  }
};

// ==========================
// 3. Controller: Update user status
// ==========================
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate required fields
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID & status are required",
      });
    }

    // 2. Validate status against enum values
    if (!Object.values(USER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses: Object.values(USER_STATUS),
      });
    }

    // 3. Only ADMIN  can update
    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins are authorized to update user accounts",
      });
    }

    // Perform update
    const data = await userService.updatedUser(id as string, status);

    // 4. Check if user exists
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in updatedUser controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// ==========================
// 4. Controller: Delete user by ADMIN
// ==========================
const deleteUserByAdmin = async (req: Request, res: Response) => {
  try {
    const admin = req.user;
    const { userId } = req.params;

    // Only ADMIN can delete other users
    if (!admin || admin.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    // Perform delete
    await userService.deleteUser(userId as string);

    return res.status(200).json({
      success: true,
      message: "User account has been deactivated by admin",
    });
  } catch (error: any) {
    console.error("Admin delete user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

// ==========================
// 5. Controller: Delete own account (SELLER or CUSTOMER only)
// ==========================
const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // Must be logged in
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Only SELLER or CUSTOMER can delete their account
    if (user.role !== ROLE.SELLER && user.role !== ROLE.CUSTOMER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers & customers can delete their account",
      });
    }

    // Perform delete
    await userService.deleteUser(user.id);

    return res.status(200).json({
      success: true,
      message: "Your account has been deactivated",
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete account",
    });
  }
};

export const userController = {
  getAllUsers,
  getCurrentUser,
  updateUser,
  deleteUserByAdmin,
  deleteMyAccount,
};
