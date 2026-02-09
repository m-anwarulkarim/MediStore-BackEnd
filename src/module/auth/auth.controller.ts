import type { Request, Response } from "express";
import { userService } from "./auth.service";
import { ROLE, USER_STATUS } from "../../generated/prisma/enums";

// ==========================
// 1. Get all users (ADMIN only)
// ==========================
const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const data = await userService.getAllUsers();

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in getAllUsers controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

// ==========================
// 2. Get current logged-in user
// ==========================
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await userService.getCurrentUser(user.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error in getCurrentUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user",
    });
  }
};

// ==========================
// 3. Update user status (ADMIN only)
// ==========================
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required",
      });
    }

    // Validate status against enum values
    if (!Object.values(USER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses: Object.values(USER_STATUS),
      });
    }

    // Only ADMIN can update
    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const data = await userService.updatedUser(id as string, status);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in updateUser controller:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// ==========================
// 4. Delete user by ADMIN
// ==========================
const deleteUserByAdmin = async (req: Request, res: Response) => {
  try {
    const admin = req.user;
    const { userId } = req.params;

    if (!admin || admin.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Prevent admin from deleting themselves
    if (admin.id === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    await userService.deleteUser(userId as string);

    return res.status(200).json({
      success: true,
      message: "User account has been suspended",
    });
  } catch (error: any) {
    console.error("Admin delete user error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ==========================
// 5. Delete own account (SELLER or CUSTOMER only)
// ==========================
const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role !== ROLE.SELLER && user.role !== ROLE.CUSTOMER) {
      return res.status(403).json({
        success: false,
        message: "Only sellers and customers can delete their account",
      });
    }

    await userService.deleteUser(user.id);

    return res.status(200).json({
      success: true,
      message: "Your account has been deactivated",
    });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};

const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as { role: ROLE };

  const result = await userService.updateUserRoleAndInitSellerProfile(
    id as string,
    role,
  );

  return res.status(200).json({
    success: true,
    message: "User role updated (seller profile initialized if needed)",
    data: result,
  });
};
export const userController = {
  getAllUsers,
  getCurrentUser,
  updateUser,
  deleteUserByAdmin,
  deleteMyAccount,
  updateUserRole,
};
